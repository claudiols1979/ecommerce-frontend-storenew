import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    IconButton,
    Paper,
    Typography,
    TextField,
    List,
    ListItem,
    Fade,
    CircularProgress,
    Avatar,
    styled,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";

// --- Styled Components for Premium Analytics Look ---

const ChatContainer = styled(Box)(({ theme }) => ({
    position: "fixed",
    bottom: 25,
    right: 25,
    zIndex: 2000, // Increased to be on top of Header (drawer is usually 1200, header 1100)
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    fontFamily: "'Inter', sans-serif",
    [theme.breakpoints.down("sm")]: {
        bottom: 15,
        right: 15,
    },
}));

const ChatWindow = styled(Paper)(({ theme }) => ({
    width: 380,
    height: 550,
    marginBottom: 15,
    display: "flex",
    flexDirection: "column",
    borderRadius: 24,
    overflow: "hidden",
    // Specific Gradient Requested by User
    background: 'linear-gradient(135deg, rgba(49, 0, 138, 0.95) 0%, rgba(49, 0, 138, 0.95) 35%, rgba(168, 85, 247, 0.95) 65%, rgba(247, 37, 133, 0.95) 100%) !important',
    backdropFilter: "blur(10px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    [theme.breakpoints.down("sm")]: {
        width: "calc(100vw - 30px)",
        height: "calc(100vh - 200px)", // More room at the top (lowest top edge)
        maxHeight: "500px",
    },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
}));

const MessageList = styled(List)({
    flexGrow: 1,
    overflowY: "auto",
    padding: "20px",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    "&::-webkit-scrollbar": {
        width: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
        background: "rgba(255,255,255,0.2)",
        borderRadius: "10px",
    },
});

const MessageBubble = styled(Box)(({ isAi, theme }) => ({
    backgroundColor: isAi ? "rgba(255,255,255,0.15)" : "#fff",
    color: isAi ? "#fff" : "#31008A",
    padding: "12px 16px",
    borderRadius: isAi ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
    maxWidth: "85%",
    boxShadow: isAi ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    wordWrap: "break-word",
}));

const InputContainer = styled(Box)({
    padding: "20px",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderTop: "1px solid rgba(255,255,255,0.1)",
});

const StyledTextField = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: "30px",
        color: "#fff",
        "& fieldset": {
            borderColor: "rgba(255,255,255,0.2)",
        },
        "&:hover fieldset": {
            borderColor: "rgba(255,255,255,0.4)",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#fff",
        },
    },
    "& .MuiInputBase-input::placeholder": {
        color: "rgba(255,255,255,0.6)",
        opacity: 1,
    },
});

const GradientButton = styled(IconButton)(({ theme }) => ({
    // Specific Gradient for Buttons Requested by User
    background: 'linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important',
    color: "#fff",
    width: 60,
    height: 60,
    boxShadow: "0 6px 20px rgba(247, 37, 133, 0.4)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
        transform: "scale(1.1)",
        boxShadow: "0 8px 25px rgba(247, 37, 133, 0.6)",
    },
}));

const ChatWidget = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState([
        {
            role: "assistant",
            content: "Indique el producto o número de pedido que desea consultar.",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const scrollRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        let sId = sessionStorage.getItem("chat_session_id");
        if (!sId) {
            sId = Math.random().toString(36).substring(7);
            sessionStorage.setItem("chat_session_id", sId);
        }
        setSessionId(sId);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isLoading]);

    // Click outside to close logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = { role: "user", content: message };
        setHistory((prev) => [...prev, userMessage]);
        const currentMessage = message;
        setMessage("");
        setIsLoading(true);

        try {
            const baseUrl = typeof config === 'string' ? config : config?.API_URL || "http://localhost:5000";

            const storedUser = localStorage.getItem("user");
            const userObj = storedUser ? JSON.parse(storedUser) : null;
            const token = userObj?.token;

            const { data } = await axios.post(`${baseUrl}/api/chat`, {
                message: currentMessage,
                sessionId,
            }, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ''
                }
            });

            setHistory((prev) => [...prev, { role: "assistant", content: data.message }]);
        } catch (error) {
            console.error("Chat error:", error);
            const serverError = error.response?.data?.message || "Lo siento, tuve un problema de conexión. Por favor intente más tarde.";
            setHistory((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: serverError,
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user) return null;

    return (
        <ChatContainer ref={chatContainerRef}>
            <Fade in={isOpen}>
                <Box sx={{ display: isOpen ? "block" : "none" }}>
                    <ChatWindow elevation={0}>
                        <ChatHeader>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        background: 'linear-gradient(90deg, #A855F7 0%, #F72585 100%)',
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    <SmartToyIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
                                        Asistente Virtual
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.7, textTransform: "uppercase", fontSize: 10, fontWeight: 700 }}>
                                        Online
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "#fff", background: "rgba(255,255,255,0.1)" }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </ChatHeader>

                        <MessageList ref={scrollRef}>
                            {history.map((msg, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        flexDirection: "column",
                                        alignItems: msg.role === "assistant" ? "flex-start" : "flex-end",
                                        padding: 0,
                                        width: "100%"
                                    }}
                                >
                                    <MessageBubble isAi={msg.role === "assistant"}>
                                        <Typography variant="body2" sx={{ fontWeight: msg.role === "assistant" ? 400 : 500 }}>
                                            {msg.content}
                                        </Typography>
                                    </MessageBubble>
                                </ListItem>
                            ))}
                            {isLoading && (
                                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
                                    <CircularProgress size={14} sx={{ color: "#fff" }} />
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
                                        Buscando información...
                                    </Typography>
                                </Box>
                            )}
                        </MessageList>

                        <InputContainer>
                            <StyledTextField
                                fullWidth
                                size="small"
                                placeholder="Escriba su consulta aquí..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            size="small"
                                            onClick={handleSend}
                                            sx={{
                                                color: "#fff",
                                                background: 'linear-gradient(90deg, #A855F7 0%, #F72585 100%)',
                                                "&:hover": { opacity: 0.9 }
                                            }}
                                        >
                                            <SendIcon fontSize="small" />
                                        </IconButton>
                                    ),
                                }}
                            />
                        </InputContainer>
                    </ChatWindow>
                </Box>
            </Fade>

            <GradientButton
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Abrir Asistente"
            >
                {isOpen ? <CloseIcon /> : <SmartToyIcon sx={{ fontSize: "28px" }} />}
            </GradientButton>
        </ChatContainer>
    );
};

export default ChatWidget;
