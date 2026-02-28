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
  Paper,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AuthBranding from "../components/common/AuthBranding";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const result = await forgotPassword(email);

    if (result.success) {
      setMessage(
        result.message ||
        "Si tu correo está registrado, recibirás las instrucciones en breve.",
      );
    } else {
      setError(result.message || "Error al solicitar el enlace.");
    }

    setLoading(false);
  };

  // Nuevos estilos que coinciden con PrivacyPolicyPage
  const primaryButtonStyle = {
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
                  mb: 1,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Restablecer Contraseña
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  mb: 4,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                Ingresa tu correo electrónico y te enviaremos un enlace para
                restablecer tu contraseña.
              </Typography>

              {message ? (
                <Box textAlign="center">
                  <Alert
                    severity="success"
                    sx={{
                      mb: 3,
                      bgcolor: "rgba(76, 175, 80, 0.2)",
                      color: "#fff",
                      border: "1px solid #4caf50",
                      borderRadius: "8px",
                    }}
                  >
                    {message}
                  </Alert>
                </Box>
              ) : (
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{ mt: 2 }}
                >
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
                    id="email"
                    label="Correo Electrónico"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <EmailOutlinedIcon
                          sx={{
                            mr: 1,
                            color: iconColor,
                          }}
                        />
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={primaryButtonStyle}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Enviar Enlace"
                    )}
                  </Button>
                </Box>
              )}

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
                  ← Volver a Iniciar Sesión
                </MuiLink>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default ForgotPasswordPage;
