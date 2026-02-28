import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Link as MuiLink,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AuthBranding from "../components/common/AuthBranding";
import CRAddressSelector from "../components/CRAddressSelector";

// Iconos para los campos
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    city: "",
    province: "",
    provincia: "",
    canton: "",
    distrito: "",
    // ✅ NUEVOS CAMPOS PARA DOLIBARR
    tipoIdentificacion: "",
    cedula: "",
    codigoActividadReceptor: "",
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");

  const { register, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // ✅ OPCIONES PARA TIPO DE IDENTIFICACIÓN
  const tiposIdentificacion = [
    { value: "Fisica", label: "Persona Física" },
    { value: "Juridica", label: "Persona Jurídica" },
  ];

  useEffect(() => {
    console.log("Forcing React hot reload from Antigravity");
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    phoneNumber,
    address,
    city,
    province,
    provincia,
    canton,
    distrito,
    tipoIdentificacion,
    cedula,
    codigoActividadReceptor,
  } = formData;

  const onChange = (e) => {
    let value = e.target.value;

    let processedValue = value;

    if (e.target.name === "cedula") {
      processedValue = value.replace(/[-]/g, "");
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear global error when user changes data
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  // ✅ VALIDACIONES CONDICIONALES
  const validateForm = () => {
    const errors = {};

    // Validaciones básicas
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Las contraseñas no coinciden." });
      return false;
    }
    if (password.length < 6) {
      setFieldErrors({ password: "La contraseña debe tener al menos 6 caracteres." });
      return false;
    }
    if (!provincia || !canton || !distrito) {
      errors.provincia = "Por favor seleccione provincia, cantón y distrito.";
    }

    // ✅ VALIDACIONES PARA CAMPOS NUEVOS
    if (!tipoIdentificacion) {
      errors.tipoIdentificacion =
        "Por favor seleccione el tipo de identificación.";
    }

    if (!cedula) {
      errors.cedula = "La cédula es requerida.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    // ✅ INCLUIR TODOS LOS CAMPOS en los datos del usuario
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
      city: canton, // Fallback backward compatibility
      province: provincia, // Fallback backward compatibility
      provincia,
      canton,
      distrito,
      tipoIdentificacion,
      cedula: cedula ? cedula.replace(/[-]/g, "") : "",
      codigoActividadReceptor,
    };

    const result = await register(userData);
    if (!result.success) {
      setError(result.message || "Error al registrarse.");
    }
    setLoading(false);
  };

  if (user) {
    return null;
  }

  const primaryButtonStyle = {
    p: 1.5,
    mb: 2,
    mt: 3,
    fontWeight: "bold",
    fontSize: "1rem",
    borderRadius: "12px",
    color: "white",
    background:
      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #c471ed 100%)",
    boxShadow: "0 4px 20px 0 rgba(118, 75, 162, 0.4)",
    transition: "all 0.3s ease",
    textTransform: "none",
    letterSpacing: "0.5px",
    "&:hover": {
      background:
        "linear-gradient(135deg, #764ba2 0%, #c471ed 50%, #f64f59 100%)",
      boxShadow: "0 6px 30px 0 rgba(118, 75, 162, 0.6)",
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
    "& .MuiFormHelperText-root": {
      color: "rgba(255, 255, 255, 0.6)",
    },
    "& .MuiFormHelperText-root.Mui-error": {
      color: "#ff8a80",
    },
    "& .MuiSelect-icon": {
      color: "rgba(255, 255, 255, 0.7)",
    },
    "& .MuiInputBase-input": {
      color: "#fff",
    },
  };

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

  const iconColor = "rgba(255, 255, 255, 0.75)";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        // Deep purple base with layered radial blobs for abstract fluid look
        background: `
          radial-gradient(ellipse 80% 60% at 20% 80%, rgba(200, 50, 180, 0.9) 0%, transparent 55%),
          radial-gradient(ellipse 70% 80% at 75% 20%, rgba(90, 50, 220, 0.85) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 120, 200, 0.6) 0%, transparent 50%),
          radial-gradient(ellipse 50% 70% at 30% 30%, rgba(100, 100, 255, 0.7) 0%, transparent 45%),
          radial-gradient(ellipse 90% 50% at 80% 70%, rgba(220, 60, 150, 0.8) 0%, transparent 50%),
          radial-gradient(ellipse 40% 40% at 60% 40%, rgba(255, 200, 255, 0.5) 0%, transparent 40%),
          linear-gradient(135deg, #3a0663 0%, #5b1a8a 30%, #7b2fbe 60%, #4a1080 100%)
        `,
        py: { xs: 4, md: 6 },
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        ...floatingOrb1,
        ...floatingOrb2,
        ...floatingOrb3,
        // Large magenta swirl blob - top right
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
        // Cool blue-purple swirl blob - bottom left
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
      {/* Extra decorative blobs using Box elements */}
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
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Card
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            "&:hover": {
              transform: "none",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
            },
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <AuthBranding lightMode={true} />

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

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 4,
                fontWeight: 600,
                color: "#ffffff",
                textShadow: "0 2px 10px rgba(0,0,0,0.15)",
              }}
            >
              Crear Cuenta Nueva
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <Grid container spacing={2} direction="column">
                {/* Campos Personales */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="Nombre"
                    name="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={onChange}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <PersonOutlineOutlinedIcon
                          sx={{ mr: 1, color: iconColor }}
                        />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Apellido"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={onChange}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <PersonOutlineOutlinedIcon
                          sx={{ mr: 1, color: iconColor }}
                        />
                      ),
                    }}
                  />
                </Grid>

                {/* ✅ TIPO DE IDENTIFICACIÓN */}
                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={textFieldStyle}
                    error={!!fieldErrors.tipoIdentificacion}
                  >
                    <InputLabel id="tipoIdentificacion-label">
                      Tipo de Identificación
                    </InputLabel>
                    <Select
                      labelId="tipoIdentificacion-label"
                      required
                      name="tipoIdentificacion"
                      value={tipoIdentificacion}
                      onChange={onChange}
                      label="Tipo de Identificación"
                      startAdornment={
                        <BadgeOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                      }
                    >
                      <MenuItem value="">
                        <em>Seleccionar tipo</em>
                      </MenuItem>
                      {tiposIdentificacion.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.tipoIdentificacion && (
                      <FormHelperText>
                        {fieldErrors.tipoIdentificacion}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                {/* ✅ CÉDULA - Requerido para todos excepto si no hay tipo seleccionado */}
                <Grid item xs={12}>
                  <TextField
                    required={["Fisica", "Juridica"].includes(
                      tipoIdentificacion,
                    )}
                    fullWidth
                    name="cedula"
                    label={
                      tipoIdentificacion === "Juridica"
                        ? "Cédula Jurídica"
                        : "Cédula Física"
                    }
                    id="cedula"
                    value={cedula}
                    onChange={onChange}
                    variant="outlined"
                    sx={textFieldStyle}
                    error={!!fieldErrors.cedula}
                    helperText={fieldErrors.cedula}
                    InputProps={{
                      startAdornment: (
                        <BadgeOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                      ),
                    }}
                    placeholder={
                      tipoIdentificacion === "Juridica"
                        ? "Ingrese cédula jurídica"
                        : "Cédula, Dimex o NITE"
                    }
                  />
                </Grid>

                {/* ✅ CÓDIGO ACTIVIDAD RECEPTOR - Solo requerido para Jurídica */}
                <Grid item xs={12}>
                  <TextField
                    required={tipoIdentificacion === "Juridica"}
                    fullWidth
                    name="codigoActividadReceptor"
                    label="Código Actividad Receptor (Opcional)"
                    id="codigoActividadReceptor"
                    value={codigoActividadReceptor}
                    onChange={onChange}
                    variant="outlined"
                    sx={textFieldStyle}
                    error={!!fieldErrors.codigoActividadReceptor}
                    helperText={
                      fieldErrors.codigoActividadReceptor ||
                      "Requerido solo para persona jurídica"
                    }
                    InputProps={{
                      startAdornment: (
                        <BusinessCenterIcon sx={{ mr: 1, color: iconColor }} />
                      ),
                    }}
                    placeholder="Ej: 620100, 461000, etc."
                  />
                </Grid>

                {/* Campos de Contacto */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Correo Electrónico"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={onChange}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <EmailOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={onChange}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <LockOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar Contraseña"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <LockOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="phoneNumber"
                    label="Número de Teléfono"
                    type="tel"
                    id="phoneNumber"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={onChange}
                    variant="outlined"
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <PhoneOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                      ),
                    }}
                  />
                </Grid>

                {/* Ubicación (Selector Geográfico CR) */}
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, ml: 1, color: "rgba(255, 255, 255, 0.75)" }}
                  >
                    Dirección de Entrega
                  </Typography>
                  <CRAddressSelector
                    provincia={provincia}
                    setProvincia={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        provincia: val,
                      }))
                    }
                    canton={canton}
                    setCanton={(val) =>
                      setFormData((prev) => ({ ...prev, canton: val }))
                    }
                    distrito={distrito}
                    setDistrito={(val) =>
                      setFormData((prev) => ({ ...prev, distrito: val }))
                    }
                    vertical={true}
                    customStyle={textFieldStyle}
                    icon={<LocationOnIcon sx={{ mr: 1, color: iconColor }} />}
                  />
                  {fieldErrors.provincia && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, display: "block", color: "#ff8a80" }}
                    >
                      {fieldErrors.provincia}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="address"
                    label="Dirección Completa"
                    id="address"
                    autoComplete="shipping address-line1"
                    value={address}
                    onChange={onChange}
                    variant="outlined"
                    multiline
                    rows={2}
                    sx={textFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <HomeOutlinedIcon
                          sx={{
                            mr: 1,
                            color: iconColor,
                            alignSelf: "flex-start",
                          }}
                        />
                      ),
                    }}
                    placeholder="Otras señas: número de casa, edificio, etc."
                  />
                </Grid>
              </Grid>

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
                  "Crear Cuenta"
                )}
              </Button>
              <Typography
                variant="body2"
                align="center"
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                ¿Ya tienes una cuenta?{" "}
                <MuiLink
                  component={RouterLink}
                  to="/login"
                  underline="hover"
                  sx={{
                    fontWeight: "bold",
                    color: "#ffffff",
                    "&:hover": { color: "rgba(255, 255, 255, 0.9)" },
                  }}
                >
                  Inicia sesión aquí
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;
