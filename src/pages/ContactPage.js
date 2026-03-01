import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    useTheme,
    alpha,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import HistoryIcon from "@mui/icons-material/History";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../contexts/AuthContext";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton
} from "@mui/material";

const mainGradient =
    "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(49, 0, 138, 0.85) 35%, rgba(168, 85, 247, 0.85) 65%, rgba(247, 37, 133, 0.85) 100%) !important";

const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "24px",
    color: "white",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
};

const ContactPage = () => {
    const { user, api } = useAuth();
    const theme = useTheme();
    const [formData, setFormData] = useState({
        name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
        email: user ? user.email : "",
        subject: "",
        message: "",
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                email: user.email || ""
            }));
        }
    }, [user]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Claims History State
    const [myClaims, setMyClaims] = useState([]);
    const [fetchingClaims, setFetchingClaims] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    const fetchMyClaims = async () => {
        if (!user) return;
        setFetchingClaims(true);
        try {
            const response = await api.get("/api/claims/my-claims");
            setMyClaims(response.data);
        } catch (err) {
            console.error("Error fetching claims:", err);
        } finally {
            setFetchingClaims(false);
        }
    };

    useEffect(() => {
        fetchMyClaims();
    }, [user]);

    const handleOpenClaimDetail = async (claimId) => {
        try {
            const response = await api.get(`/api/claims/${claimId}`);
            setSelectedClaim(response.data);
        } catch (err) {
            console.error("Error fetching claim details:", err);
        }
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedClaim) return;
        setSendingReply(true);
        try {
            const response = await api.post(`/api/claims/${selectedClaim._id}/messages`, { content: replyMessage });
            // Re-fetch detail to show new message
            const detailResponse = await api.get(`/api/claims/${selectedClaim._id}`);
            setSelectedClaim(detailResponse.data);
            setReplyMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusChip = (status) => {
        const statusMap = {
            open: { label: "Abierto", color: "error" },
            "in-progress": { label: "En Proceso", color: "info" },
            resolved: { label: "Resuelto", color: "success" },
            closed: { label: "Cerrado", color: "default" },
        };
        const config = statusMap[status] || { label: status, color: "default" };
        return <Chip label={config.label} color={config.color} size="small" variant="filled" />;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post("/api/contact", formData);
            setSuccess(true);
            // Reset but keep user info if logged in
            setFormData({
                name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
                email: user ? user.email : "",
                subject: "",
                message: ""
            });
        } catch (err) {
            setError(err.response?.data?.message || "Error al enviar el mensaje. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "80vh",
                py: 8,
                background: mainGradient,
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
            }}
        >
            <Container maxWidth="md">
                <Typography
                    variant="h3"
                    sx={{
                        textAlign: "center",
                        mb: 6,
                        fontWeight: 800,
                        color: "white",
                        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    }}
                >
                    Contacto
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card sx={glassStyle}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                    <MailOutlineIcon sx={{ mr: 2, fontSize: 32 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                        Escríbenos
                                    </Typography>
                                </Box>

                                {success && (
                                    <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
                                        Mensaje enviado exitosamente. Nos pondremos en contacto pronto.
                                    </Alert>
                                )}

                                {error && (
                                    <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
                                        {error}
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        sx={{ mb: 2, "& .MuiInputBase-root": { color: "white" }, "& .MuiInputLabel-root": { color: alpha("#fff", 0.7) } }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Correo Electrónico"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        sx={{ mb: 2, "& .MuiInputBase-root": { color: "white" }, "& .MuiInputLabel-root": { color: alpha("#fff", 0.7) } }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Asunto"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        sx={{ mb: 2, "& .MuiInputBase-root": { color: "white" }, "& .MuiInputLabel-root": { color: alpha("#fff", 0.7) } }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Mensaje"
                                        name="message"
                                        multiline
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        sx={{ mb: 3, "& .MuiInputBase-root": { color: "white" }, "& .MuiInputLabel-root": { color: alpha("#fff", 0.7) } }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        type="submit"
                                        disabled={loading}
                                        sx={{
                                            py: 1.5,
                                            fontWeight: "bold",
                                            borderRadius: "12px",
                                            background: "rgba(255,255,255,0.2)",
                                            "&:hover": { background: "rgba(255,255,255,0.3)" },
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar Mensaje"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ ...glassStyle, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", p: 4 }}>
                            <SupportAgentIcon sx={{ fontSize: 80, mb: 3, mx: "auto" }} />
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                                ¿Tienes un problema con tu pedido?
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
                                Si necesitas realizar un reclamo sobre una compra existente, por favor utiliza nuestro sistema especializado.
                            </Typography>
                            <Button
                                variant="contained"
                                component={RouterLink}
                                to="/claims"
                                sx={{
                                    py: 2,
                                    px: 4,
                                    fontWeight: "bold",
                                    borderRadius: "16px",
                                    background: "#F72585",
                                    "&:hover": { background: "#D91B6F" },
                                    mb: 2
                                }}
                            >
                                Abrir un Reclamo
                            </Button>
                        </Card>
                    </Grid>
                </Grid>

                {/* User Claims History Section */}
                {user && (
                    <Box sx={{ mt: 8 }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                            <HistoryIcon sx={{ mr: 2, color: "white", fontSize: 32 }} />
                            <Typography variant="h4" sx={{ fontWeight: 800, color: "white" }}>
                                Mis Reclamos
                            </Typography>
                        </Box>

                        <Card sx={glassStyle}>
                            <CardContent sx={{ p: 0 }}>
                                {fetchingClaims ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                                        <CircularProgress color="inherit" />
                                    </Box>
                                ) : myClaims.length === 0 ? (
                                    <Box sx={{ p: 4, textAlign: "center" }}>
                                        <Typography sx={{ opacity: 0.7 }}>No tienes reclamos registrados.</Typography>
                                    </Box>
                                ) : (
                                    <List>
                                        {myClaims.map((claim, index) => (
                                            <React.Fragment key={claim._id}>
                                                <ListItem
                                                    button
                                                    onClick={() => handleOpenClaimDetail(claim._id)}
                                                    sx={{
                                                        py: 2,
                                                        "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" }
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <Typography sx={{ fontWeight: 700 }}>{claim.subject}</Typography>
                                                                {getStatusChip(claim.status)}
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                                                                {claim.order ? `Pedido #${claim.order._id.slice(-6)}` : "Sin pedido específico"} • {new Date(claim.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < myClaims.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Claim Detail & Messaging Dialog */}
                <Dialog
                    open={Boolean(selectedClaim)}
                    onClose={() => setSelectedClaim(null)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: "24px",
                            background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
                            color: "white"
                        }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 800 }}>
                        {selectedClaim?.subject}
                        <Box sx={{ mt: 1 }}>{selectedClaim && getStatusChip(selectedClaim.status)}</Box>
                    </DialogTitle>
                    <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.1)" }}>
                        <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
                            {selectedClaim?.messages.map((msg, i) => {
                                const isMe = msg.sender.role !== "Administrador" && msg.sender.role !== "Editor";
                                return (
                                    <Box key={i} sx={{ mb: 3, textAlign: isMe ? "right" : "left" }}>
                                        <Box
                                            sx={{
                                                display: "inline-block",
                                                p: 2,
                                                borderRadius: "16px",
                                                backgroundColor: isMe ? "rgba(247, 37, 133, 0.2)" : "rgba(255, 255, 255, 0.1)",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                maxWidth: "85%",
                                                textAlign: "left"
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.5, opacity: 0.7 }}>
                                                {isMe ? "Tú" : `${msg.sender.firstName} (Soporte)`}
                                            </Typography>
                                            <Typography variant="body2">{msg.content}</Typography>
                                            <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.5, fontSize: "0.7rem" }}>
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {(selectedClaim?.status !== "resolved" && selectedClaim?.status !== "closed") ? (
                            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Escribe un mensaje..."
                                    variant="outlined"
                                    size="small"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            color: "white",
                                            backgroundColor: "rgba(255,255,255,0.05)",
                                            borderRadius: "12px",
                                            "& fieldset": { borderColor: "rgba(255,255,255,0.2)" }
                                        }
                                    }}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={handleSendReply}
                                    disabled={sendingReply || !replyMessage.trim()}
                                    sx={{ backgroundColor: "#F72585", color: "white", "&:hover": { backgroundColor: "#D91B6F" } }}
                                >
                                    {sendingReply ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                                </IconButton>
                            </Box>
                        ) : (
                            <Alert severity="info" sx={{ mt: 3, borderRadius: "12px", backgroundColor: "rgba(2, 136, 209, 0.1)", color: "#90caf9" }}>
                                Este reclamo ha sido marcado como {selectedClaim?.status === "resolved" ? "resuelto" : "cerrado"} y no acepta más mensajes.
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            onClick={() => setSelectedClaim(null)}
                            sx={{ color: "rgba(255,255,255,0.7)" }}
                        >
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ContactPage;
