import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Link as MuiLink,
  Alert,
  useTheme,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import AuthBranding from "../components/common/AuthBranding";
import { Helmet } from "react-helmet-async";

// Iconos
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const NewPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const theme = useTheme();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    const result = await resetPassword(token, password);

    if (result.success) {
      setMessage(result.message || "Tu contraseña ha sido restablecida con éxito.");
    } else {
      setError(result.message || "Error al restablecer la contraseña.");
    }

    setLoading(false);
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(4px)",
      color: "#fff",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.6)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(255, 255, 255, 0.8)",
      },
      "& input::placeholder": {
        color: "rgba(255, 255, 255, 0.5)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.7)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#ffffff",
    },
    "& .MuiInputBase-input": {
      color: "#fff",
    },
  };

  const iconColor = "rgba(255, 255, 255, 0.75)";

  // Animated floating orb keyframes
  const floatingOrb1 = {
    "@keyframes floatOrb1": {
      "0%": { transform: "translate(0, 0) scale(1) rotate(0deg)" },
      "33%": { transform: "translate(60px, -80px) scale(1.2) rotate(120deg)" },
      "66%": { transform: "translate(-40px, 40px) scale(0.8) rotate(240deg)" },
      "100%": { transform: "translate(0, 0) scale(1) rotate(360deg)" },
    },
  };

  const floatingOrb2 = {
    "@keyframes floatOrb2": {
      "0%": { transform: "translate(0, 0) scale(1) rotate(0deg)" },
      "33%": { transform: "translate(-60px, 60px) scale(1.3) rotate(-120deg)" },
      "66%": { transform: "translate(50px, -50px) scale(0.7) rotate(-240deg)" },
      "100%": { transform: "translate(0, 0) scale(1) rotate(-360deg)" },
    },
  };

  const floatingOrb3 = {
    "@keyframes floatOrb3": {
      "0%": { transform: "translate(0, 0) scale(1)" },
      "50%": { transform: "translate(40px, 60px) scale(1.15)" },
      "100%": { transform: "translate(0, 0) scale(1)" },
    },
  };

  return (
    <>
      <Helmet>
        <title>Nueva Contraseña - Software Factory ERP</title>
        <meta
          name="description"
          content="Establece una nueva contraseña para tu cuenta de revendedor."
        />
      </Helmet>

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background: `
          radial-gradient(ellipse 80% 60% at 20% 80%, rgba(200, 50, 180, 0.9) 0%, transparent 55%),
          radial-gradient(ellipse 70% 80% at 75% 20%, rgba(90, 50, 220, 0.85) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 120, 200, 0.6) 0%, transparent 50%),
          radial-gradient(ellipse 50% 70% at 30% 30%, rgba(100, 100, 255, 0.7) 0%, transparent 45%),
          radial-gradient(ellipse 90% 50% at 80% 70%, rgba(220, 60, 150, 0.8) 0%, transparent 50%),
          radial-gradient(ellipse 40% 40% at 60% 40%, rgba(255, 200, 255, 0.5) 0%, transparent 40%),
          linear-gradient(135deg, #3a0663 0%, #5b1a8a 30%, #7b2fbe 60%, #4a1080 100%)
        `,
          py: { xs: 4, md: 8 },
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          ...floatingOrb1,
          ...floatingOrb2,
          ...floatingOrb3,
          "&::before": {
            content: '""',
            position: "absolute",
            width: "700px",
            height: "700px",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            background:
              "radial-gradient(ellipse at center, rgba(220, 40, 160, 0.7) 0%, rgba(180, 30, 200, 0.4) 40%, transparent 70%)",
            top: "-200px",
            right: "-150px",
            animation: "floatOrb1 12s ease-in-out infinite",
            pointerEvents: "none",
            filter: "blur(30px)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%",
            background:
              "radial-gradient(ellipse at center, rgba(80, 60, 230, 0.7) 0%, rgba(120, 80, 255, 0.4) 40%, transparent 70%)",
            bottom: "-150px",
            left: "-120px",
            animation: "floatOrb2 14s ease-in-out infinite",
            pointerEvents: "none",
            filter: "blur(25px)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50% 40% 60% 40% / 60% 30% 70% 40%",
            background:
              "radial-gradient(ellipse at center, rgba(255, 150, 220, 0.5) 0%, rgba(255, 100, 180, 0.2) 50%, transparent 70%)",
            top: "30%",
            left: "10%",
            animation: "floatOrb3 10s ease-in-out infinite",
            pointerEvents: "none",
            filter: "blur(40px)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "30% 70% 50% 50% / 50% 40% 60% 50%",
            background:
              "radial-gradient(ellipse at center, rgba(255, 220, 255, 0.45) 0%, rgba(200, 150, 255, 0.15) 50%, transparent 70%)",
            top: "10%",
            left: "40%",
            animation: "floatOrb2 16s ease-in-out infinite",
            pointerEvents: "none",
            filter: "blur(35px)",
            zIndex: 0,
          }}
        />
        <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
          <Card
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              backgroundColor: "rgba(255, 255, 255, 0.1) !important",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              "&:hover": {
                transform: "none",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important",
              },
            }}
          >
            <CardContent>
              <AuthBranding lightMode={true} />

              <Typography
                variant="h5"
                component="h1"
                sx={{
                  textAlign: "center",
                  mb: 2,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Establecer Nueva Contraseña
              </Typography>

              {message && (message.includes("exitosamente") || message.includes("éxito")) ? (
                <Box textAlign="center">
                  <Alert
                    severity={message.includes("exitosamente") || message.includes("éxito") ? "success" : "error"}
                    sx={{
                      mb: 3,
                      bgcolor: message.includes("exitosamente") || message.includes("éxito") ? "rgba(76, 175, 80, 0.2)" : "rgba(211, 47, 47, 0.2)",
                      color: "#fff",
                      border: message.includes("exitosamente") || message.includes("éxito") ? "1px solid #4caf50" : "1px solid #d32f2f",
                      borderRadius: "8px",
                    }}
                  >
                    {message}
                  </Alert>
                  <Button
                    variant="contained"
                    sx={{
                      p: 1.5,
                      mb: 2,
                      fontWeight: "bold",
                      fontSize: "1rem",
                      borderRadius: "8px",
                      color: "white",
                      background:
                        "linear-gradient(135deg, #9b2fbe 0%, #c471ed 50%, #e056a0 100%)",
                      boxShadow: "0 4px 20px rgba(180, 60, 160, 0.5)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #c471ed 0%, #e056a0 50%, #f64f59 100%)",
                        boxShadow: "0 6px 30px rgba(180, 60, 160, 0.7)",
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => navigate("/login")}
                  >
                    Ir a Iniciar Sesión
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  {error && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: "12px",
                        backgroundColor: "rgba(211, 47, 47, 0.1)",
                        color: "#ffcdd2",
                        "& .MuiAlert-icon": {
                          color: "#ffcdd2",
                        },
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Nueva Contraseña"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <LockOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                      ),
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <LockOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      p: 1.5,
                      mb: 2,
                      mt: 2,
                      fontWeight: "bold",
                      fontSize: "1rem",
                      borderRadius: "8px",
                      color: "white",
                      background:
                        "linear-gradient(135deg, #9b2fbe 0%, #c471ed 50%, #e056a0 100%)",
                      boxShadow: "0 4px 20px rgba(180, 60, 160, 0.5)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #c471ed 0%, #e056a0 50%, #f64f59 100%)",
                        boxShadow: "0 6px 30px rgba(180, 60, 160, 0.7)",
                        transform: "translateY(-2px)",
                      },
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Restablecer Contraseña"
                    )}
                  </Button>
                  <Box
                    sx={{
                      mt: 3,
                      textAlign: "center",
                      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                      pt: 2,
                    }}
                  >
                    <MuiLink
                      component={RouterLink}
                      to="/login"
                      underline="hover"
                      sx={{
                        color: "#fff",
                        fontWeight: 500,
                        "&:hover": {
                          color: "rgba(255, 255, 255, 0.8)",
                        },
                      }}
                    >
                      Volver a Iniciar Sesión
                    </MuiLink>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default NewPasswordPage;
