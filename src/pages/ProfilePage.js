import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useOrders } from "../contexts/OrderContext";
import { useConfig } from "../contexts/ConfigContext";
import { useUpdateInfo } from "../contexts/UpdateInfoContext"; // Import the new context
import { toast } from "react-toastify";

// Importaciones de iconos de Material-UI
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import CodeIcon from "@mui/icons-material/Code";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";
import RateReviewIcon from "@mui/icons-material/RateReview";
import EditIcon from "@mui/icons-material/Edit";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CRAddressSelector from "../components/CRAddressSelector";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError } = useAuth();
  const {
    myOrders,
    loading: ordersLoading,
    error: ordersError,
    fetchMyOrders,
  } = useOrders();
  const {
    loading: updateLoading,
    error: updateError,
    success: updateSuccess,
    updateResellerProfile,
    clearMessages,
  } = useUpdateInfo(); // Use the update context
  const { taxRegime: globalTaxRegime } = useConfig();

  const theme = useTheme();
  const [localLoading, setLocalLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "", // ✅ NUEVO CAMPO
    province: "", // ✅ NUEVO CAMPO
    provincia: "",
    canton: "",
    distrito: "",
    resellerCategory: "",
    tipoIdentificacion: "",
    cedula: "",
    codigoActividadReceptor: "",
  });

  // Modern Styles with requested gradients
  const mainGradient =
    "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(49, 0, 138, 0.85) 35%, rgba(168, 85, 247, 0.85) 65%, rgba(247, 37, 133, 0.85) 100%) !important";
  const buttonGradient =
    "linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important";

  const glassStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "24px",
    color: "white",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    transition:
      "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.45)",
    },
  };

  const accentButtonStyle = {
    background: buttonGradient,
    color: "white",
    fontWeight: "bold",
    borderRadius: "12px",
    textTransform: "none",
    px: 4,
    py: 1,
    boxShadow: "0 4px 15px rgba(247, 37, 133, 0.3)",
    "&:hover": {
      background: buttonGradient,
      opacity: 0.9,
      boxShadow: "0 6px 20px rgba(247, 37, 133, 0.5)",
      transform: "translateY(-2px)",
    },
    transition: "all 0.3s ease",
  };

  const sectionHeaderStyle = {
    fontWeight: 800,
    letterSpacing: "-0.02em",
    background: "linear-gradient(90deg, #FFFFFF 0%, #E0E0E0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    mb: 4,
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -10,
      left: 0,
      width: "60px",
      height: "4px",
      background: buttonGradient,
      borderRadius: "2px",
    },
  };

  useEffect(() => {
    console.log("🔄 User data en ProfilePage:", user);
    if (user) {
      console.log("✅ Campos nuevos en user:", {
        tipoIdentificacion: user.tipoIdentificacion,
        cedula: user.cedula,
        codigoActividadReceptor: user.codigoActividadReceptor,
      });
    }
  }, [user]);

  useEffect(() => {
    // 1. Fetch the user's orders as soon as the page loads.
    if (fetchMyOrders) {
      fetchMyOrders();
    }

    // 2. Set up an interval to call the function again every 30 seconds.
    const intervalId = setInterval(() => {
      if (fetchMyOrders) {
        console.log("Auto-refreshing user's orders on HomePage...");
        fetchMyOrders();
      }
    }, 30000); // 30000 milliseconds = 30 seconds

    // 3. Clean up by stopping the interval when the user navigates away.
    return () => clearInterval(intervalId);
  }, [fetchMyOrders]);

  useEffect(() => {
    if (
      editFormData.tipoIdentificacion !== "Juridica" &&
      editFormData.codigoActividadReceptor
    ) {
      setEditFormData((prev) => ({
        ...prev,
        codigoActividadReceptor: "",
      }));
    }
  }, [editFormData.tipoIdentificacion]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (!authLoading && user) {
      setLocalLoading(false);
      fetchMyOrders();
    }
  }, [user, authLoading, navigate, fetchMyOrders]);

  useEffect(() => {
    if (updateSuccess) {
      // Close the dialog and clear messages after a successful update
      setTimeout(() => {
        setEditDialogOpen(false);
        clearMessages();
        // You might want to refresh user data here
      }, 1500);
    }
  }, [updateSuccess, clearMessages]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      let date;
      if (dateString.includes("/")) {
        const parts = dateString.split("/");
        date = new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10),
        );
      } else {
        date = new Date(dateString);
      }

      if (!isNaN(date.getTime())) {
        const options = {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        };
        return date.toLocaleDateString("es-ES", options);
      }
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
    }
    return "Fecha inválida";
  };

  // Mapa para traducir estados de pedidos a español
  const orderStatusMap = {
    pending: "Pendiente",
    placed: "Realizado",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  // Función para obtener el estado traducido
  const getTranslatedStatus = (status) => {
    const translated = orderStatusMap[status.toLowerCase()];
    return translated
      ? translated
      : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleEditClick = () => {
    setEditFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      city: user.city || "", // ✅ NUEVO CAMPO
      province: user.province || "", // ✅ NUEVO CAMPO
      provincia: user.provincia || "",
      canton: user.canton || "",
      distrito: user.distrito || "",
      resellerCategory: user.resellerCategory || "",
      tipoIdentificacion: user.tipoIdentificacion || "",
      cedula: user.cedula || "",
      codigoActividadReceptor: user.codigoActividadReceptor || "",
    });
    setEditDialogOpen(true);
    clearMessages();
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "cedula") {
      processedValue = value.replace(/[-]/g, "");
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDACIONES EN FRONTEND
    const errors = {};

    if (!editFormData.tipoIdentificacion) {
      errors.tipoIdentificacion = "El tipo de identificación es requerido.";
    }

    if (!editFormData.cedula) {
      errors.cedula = "La cédula es requerida.";
    }

    if (Object.keys(errors).length > 0) {
      // Mostrar el primer error
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    // ✅ PROCESAR DATOS ANTES DE ENVIAR - Remover guiones de cédula
    const processedData = {
      ...editFormData,
      cedula: editFormData.cedula
        ? editFormData.cedula.replace(/[-]/g, "")
        : "",
      city: editFormData.canton, // fallback backward compatibility
      province: editFormData.provincia, // fallback backward compatibility
    };

    try {
      await updateResellerProfile(user._id, processedData);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    clearMessages();
  };

  if (authError || ordersError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: mainGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ ...glassStyle, p: 4, textAlign: "center" }}>
            <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
              {authError?.message ||
                ordersError?.message ||
                "Error al cargar los datos del perfil o pedidos."}
            </Alert>
            <Button
              onClick={() => window.location.reload()}
              variant="contained"
              sx={accentButtonStyle}
            >
              Reintentar
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: mainGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ ...glassStyle, p: 4, textAlign: "center" }}>
            <Alert severity="warning" sx={{ borderRadius: 3, mb: 3 }}>
              Por favor, inicia sesión para ver tu perfil.
            </Alert>
            <Button
              onClick={() => navigate("/login")}
              variant="contained"
              sx={accentButtonStyle}
            >
              Ir a Iniciar Sesión
            </Button>
          </Card>
        </Container>
      </Box>
    );
  }

  const iconStyle = {
    fontSize: { xs: 20, sm: 22 },
    color: "#F72585",
    mr: 1.5,
    verticalAlign: "middle",
  };

  const displayOrders = myOrders.slice(0, 10);

  const getCategoryLabel = (category) => {
    const categories = {
      cat1: "Nivel 1",
      cat2: "Nivel 2",
      cat3: "Nivel 3",
      cat4: "Nivel 4",
      cat5: "Nivel 5",
    };
    return categories[category] || category;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: mainGradient,
        pt: { xs: 12, sm: 16 },
        pb: { xs: 6, sm: 10 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background patterns */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0) 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(247, 37, 133, 0.3) 0%, rgba(247, 37, 133, 0) 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <style>
          {`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
              animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
            .delay-1 { animation-delay: 0.1s; }
            .delay-2 { animation-delay: 0.2s; }
          `}
        </style>

        {/* Edit Profile Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "32px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
              color: "white",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              py: 4,
              px: { xs: 3, sm: 5 },
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              letterSpacing: "-0.02em",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: buttonGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
                boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
              }}
            >
              <EditIcon sx={{ fontSize: 20 }} />
            </Box>
            Editar Información Personal
          </DialogTitle>

          <form onSubmit={handleEditSubmit}>
            <DialogContent sx={{ pt: 5, px: { xs: 3, sm: 5 }, pb: 2 }}>
              {updateError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 4,
                    borderRadius: "16px",
                    background: "rgba(211, 47, 47, 0.2)",
                    color: "#ffcdd2",
                    border: "1px solid rgba(211, 47, 47, 0.3)",
                  }}
                >
                  {updateError}
                </Alert>
              )}
              {updateSuccess && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 4,
                    borderRadius: "16px",
                    background: "rgba(46, 125, 50, 0.2)",
                    color: "#c8e6c9",
                    border: "1px solid rgba(46, 125, 50, 0.3)",
                  }}
                >
                  Perfil actualizado exitosamente!
                </Alert>
              )}

              <Grid container spacing={3}>
                {[
                  { label: "Nombre", name: "firstName", sm: 6, required: true },
                  {
                    label: "Apellido",
                    name: "lastName",
                    sm: 6,
                    required: true,
                  },
                  {
                    label: "Cédula",
                    name: "cedula",
                    sm: 6,
                    placeholder: "Cédula, Dimex o NITE",
                  },
                  { label: "Teléfono", name: "phoneNumber", sm: 6 },
                  {
                    label: "Código Actividad Receptor",
                    name: "codigoActividadReceptor",
                    sm: 12,
                    helperText: "Opcional - para fines tributarios",
                    placeholder: "Ej: 620100, 461000, etc.",
                  },
                ].map((field) => (
                  <Grid item xs={12} sm={field.sm} key={field.name}>
                    <TextField
                      fullWidth
                      label={field.label}
                      name={field.name}
                      value={editFormData[field.name]}
                      onChange={handleEditFormChange}
                      required={field.required}
                      placeholder={field.placeholder}
                      helperText={field.helperText}
                      variant="outlined"
                      InputLabelProps={{
                        sx: {
                          color: "rgba(255,255,255,0.7)",
                          "&.Mui-focused": { color: "#A855F7" },
                        },
                      }}
                      FormHelperTextProps={{
                        sx: { color: "rgba(255,255,255,0.5)" },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          color: "white !important",
                          background: "rgba(255, 255, 255, 0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)",
                          },
                          "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                          "& input": {
                            color: "white !important",
                            WebkitTextFillColor: "white !important",
                          },
                        },
                      }}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tipo de Identificación"
                    name="tipoIdentificacion"
                    value={editFormData.tipoIdentificacion}
                    onChange={handleEditFormChange}
                    select
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            background: "rgba(30, 0, 80, 0.95)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "white",
                            "& .MuiMenuItem-root:hover": {
                              background: "rgba(255,255,255,0.1)",
                            },
                            "& .Mui-selected": {
                              background: "rgba(168, 85, 247, 0.3) !important",
                            },
                          },
                        },
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        color: "rgba(255,255,255,0.7)",
                        "&.Mui-focused": { color: "#A855F7" },
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        color: "white !important",
                        background: "rgba(255, 255, 255, 0.05)",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.1)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                      },
                      "& .MuiSelect-select": { color: "white !important" },
                      "& .MuiSelect-icon": { color: "white !important" },
                    }}
                  >
                    <MenuItem value="">
                      <em>Ninguno</em>
                    </MenuItem>
                    <MenuItem value="Fisica">Persona Física</MenuItem>
                    <MenuItem value="Juridica">Persona Jurídica</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    disabled
                    label="Correo Electrónico (No modificable)"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    required
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "16px",
                        background: "rgba(255, 255, 255, 0.02)",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.05)",
                        },
                        "& .MuiOutlinedInput-input.Mui-disabled": {
                          color: "white !important",
                          WebkitTextFillColor: "white !important",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      ml: 1,
                      color: "rgba(255, 255, 255, 0.6)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Dirección de Entrega
                  </Typography>
                  <Box
                    sx={{
                      borderRadius: "20px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      p: 2.5,
                      "& .MuiInputLabel-root": {
                        color: "rgba(255,255,255,0.7) !important",
                      },
                      "& .MuiOutlinedInput-root": {
                        color: "white !important",
                        borderRadius: "12px",
                        background: "rgba(255, 255, 255, 0.03)",
                        "& fieldset": {
                          borderColor: "rgba(255,255,255,0.1) !important",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255,255,255,0.3) !important",
                        },
                        "& input, & select, & .MuiSelect-select": {
                          color: "white !important",
                          WebkitTextFillColor: "white !important",
                        },
                      },
                      "& .Mui-disabled": {
                        color: "rgba(255,255,255,0.4) !important",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255,255,255,0.05) !important",
                        },
                        "& input, & select, & .MuiSelect-select": {
                          color: "rgba(255,255,255,0.4) !important",
                          WebkitTextFillColor:
                            "rgba(255,255,255,0.4) !important",
                        },
                      },
                      "& .MuiSelect-icon": { color: "white !important" },
                    }}
                  >
                    <style>
                      {`
                        .MuiMenu-paper {
                          background: rgba(30, 0, 80, 0.95) !important;
                          backdrop-filter: blur(10px) !important;
                          border: 1px solid rgba(255,255,255,0.1) !important;
                          color: white !important;
                        }
                        .MuiMenuItem-root:hover {
                          background: rgba(255,255,255,0.1) !important;
                        }
                        .Mui-selected {
                          background: rgba(168, 85, 247, 0.3) !important;
                        }
                      `}
                    </style>
                    <CRAddressSelector
                      provincia={editFormData.provincia}
                      setProvincia={(val) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          provincia: val,
                        }))
                      }
                      canton={editFormData.canton}
                      setCanton={(val) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          canton: val,
                        }))
                      }
                      distrito={editFormData.distrito}
                      setDistrito={(val) =>
                        setEditFormData((prev) => ({ ...prev, distrito: val }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Dirección Exacta (Otras Señas)"
                      name="address"
                      multiline
                      rows={2}
                      value={editFormData.address}
                      onChange={handleEditFormChange}
                      InputLabelProps={{
                        sx: {
                          color: "rgba(255,255,255,0.7)",
                          "&.Mui-focused": { color: "#A855F7" },
                        },
                      }}
                      sx={{
                        mt: 2.5,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          color: "white",
                          background: "rgba(255, 255, 255, 0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.1)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.3)",
                          },
                          "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 3, sm: 5 }, pb: 5, pt: 3 }}>
              <Button
                onClick={handleCloseDialog}
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updateLoading}
                sx={{
                  ...accentButtonStyle,
                  minWidth: 160,
                  py: 1.5,
                  fontSize: "1rem",
                  ml: 2,
                }}
              >
                {updateLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Información Personal */}
        <Box className="animate-fade-in-up">
          <Typography variant="h4" sx={sectionHeaderStyle}>
            Mi Perfil
          </Typography>

          <Card
            sx={{
              ...glassStyle,
              mb: { xs: 4, sm: 6 },
              position: "relative",
              overflow: "visible",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: { xs: 20, sm: 30 },
                zIndex: 2,
              }}
            >
              <IconButton
                sx={{
                  background: buttonGradient,
                  color: "white",
                  width: 56,
                  height: 56,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                  "&:hover": {
                    background: buttonGradient,
                    transform: "scale(1.1)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
                  },
                  transition:
                    "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
                onClick={handleEditClick}
              >
                <EditIcon />
              </IconButton>
            </Box>

            <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
              <Grid container spacing={{ xs: 3, md: 4 }}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          background: "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2.5,
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <PersonIcon sx={{ color: "#A855F7" }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.6)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          Nombre Completo
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          background: "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2.5,
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <EmailIcon sx={{ color: "#F72585" }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.6)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          Correo Electrónico
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, wordBreak: "break-all" }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>

                    {user.phoneNumber && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "14px",
                            background: "rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 2.5,
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <PhoneIcon sx={{ color: "#4EA8DE" }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255,255,255,0.6)",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            Teléfono
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {user.phoneNumber}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          background: "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2.5,
                          mt: 0.5,
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <LocationOnIcon sx={{ color: "#4895EF" }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.6)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          Dirección de Entrega
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {user.provincia
                            ? `${user.provincia}, ${user.canton}, ${user.distrito}`
                            : [user.address, user.city, user.province]
                                .filter(Boolean)
                                .join(", ") || "No especificada"}
                        </Typography>
                        {user.address && (
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}
                          >
                            {user.address}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {(user.tipoIdentificacion || user.cedula) && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "14px",
                            background: "rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 2.5,
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <BadgeOutlinedIcon sx={{ color: "#7209B7" }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255,255,255,0.6)",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            Identificación (
                            {user.tipoIdentificacion || "Física"})
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {user.cedula || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {user.role === "Revendedor" && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "14px",
                            background: "rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 2.5,
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <CategoryIcon sx={{ color: "#FFC300" }} />
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255,255,255,0.6)",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            Categoría / Código
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {getCategoryLabel(user.resellerCategory)} •{" "}
                            {user.resellerCode || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Mis Pedidos Recientes */}
        <Box className="animate-fade-in-up delay-1">
          <Typography variant="h4" sx={sectionHeaderStyle}>
            Mis Pedidos Recientes
          </Typography>

          <Card sx={{ ...glassStyle, overflow: "hidden" }}>
            <CardContent sx={{ p: { xs: 0, sm: 0 }, minHeight: 200 }}>
              {displayOrders && displayOrders.length > 0 ? (
                <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
                  {displayOrders.map((order, orderIndex) => {
                    const breakdown =
                      order.taxBreakdown && order.taxBreakdown.itemsSubtotal > 0
                        ? order.taxBreakdown
                        : (() => {
                            const iSubtotal = order.items.reduce(
                              (sum, item) =>
                                sum + item.quantity * item.priceAtSale,
                              0,
                            );
                            const iTax = order.items.reduce((acc, item) => {
                              const iva = parseFloat(item.product?.iva) || 0;
                              return (
                                acc +
                                Math.round(
                                  item.quantity *
                                    item.priceAtSale *
                                    (iva / 100),
                                )
                              );
                            }, 0);

                            const currentOrderRegime =
                              order.taxRegime || globalTaxRegime;
                            const sBaseRaw = 3000;
                            const sTax =
                              currentOrderRegime === "simplified" ? 0 : 390;
                            const sBase =
                              currentOrderRegime === "simplified"
                                ? Math.round(sBaseRaw * 1.13)
                                : sBaseRaw;

                            return {
                              itemsSubtotal: iSubtotal,
                              itemsTax: iTax,
                              shippingBase: sBase,
                              shippingTax: sTax,
                              total: Math.round(
                                iSubtotal + iTax + sBase + sTax,
                              ),
                            };
                          })();

                    const totalFinal = breakdown.total;
                    const shippingCost =
                      breakdown.shippingBase + breakdown.shippingTax;

                    const formatPrice = (price) => {
                      return `₡${Math.round(price).toLocaleString("es-CR")}`;
                    };

                    const statusInfo = {
                      pending: { color: "#FFB703", label: "Pendiente" },
                      placed: { color: "#219EBC", label: "Realizado" },
                      processing: { color: "#8ECAE6", label: "En Proceso" },
                      shipped: { color: "#FB8500", label: "Enviado" },
                      delivered: { color: "#2ECC71", label: "Entregado" },
                      cancelled: { color: "#E74C3C", label: "Cancelado" },
                    };

                    const currentStatus = statusInfo[
                      order.status.toLowerCase()
                    ] || { color: "#95A5A6", label: order.status };

                    return (
                      <Accordion
                        key={order._id}
                        sx={{
                          mb: 2.5,
                          borderRadius: "16px !important",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "white",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          boxShadow: "none",
                          "&:before": { display: "none" },
                          "&.Mui-expanded": {
                            background: "rgba(255, 255, 255, 0.08)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            margin: "0 0 20px 0",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        <AccordionSummary
                          expandIcon={
                            <ExpandMoreIcon
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                            />
                          }
                          sx={{
                            px: { xs: 2.5, sm: 4 },
                            py: 1,
                            "& .MuiAccordionSummary-content": {
                              alignItems: "center",
                            },
                          }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "10px",
                                    background: "rgba(255,255,255,0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mr: 2,
                                  }}
                                >
                                  <ShoppingBagIcon
                                    sx={{ fontSize: 20, color: "#fff" }}
                                  />
                                </Box>
                                <Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "rgba(255,255,255,0.5)",
                                      display: "block",
                                      mb: -0.5,
                                    }}
                                  >
                                    ORDEN
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontWeight: 700,
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    #
                                    {order._id
                                      .substring(order._id.length - 8)
                                      .toUpperCase()}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "rgba(255,255,255,0.5)",
                                  display: "block",
                                }}
                              >
                                FECHA
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {new Date(order.createdAt).toLocaleDateString(
                                  "es-ES",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "rgba(255,255,255,0.5)",
                                  display: "block",
                                }}
                              >
                                TOTAL
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 800, color: "#fff" }}
                              >
                                {formatPrice(totalFinal)}
                              </Typography>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={3}
                              sx={{ textAlign: { sm: "right" } }}
                            >
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  px: 2,
                                  py: 0.5,
                                  borderRadius: "8px",
                                  bgcolor: `${currentStatus.color}20`,
                                  color: currentStatus.color,
                                  border: `1px solid ${currentStatus.color}40`,
                                  fontSize: "0.75rem",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {currentStatus.label}
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionSummary>
                        <AccordionDetails
                          sx={{
                            px: { xs: 2.5, sm: 4 },
                            pb: 4,
                            pt: 1,
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: "rgba(255,255,255,0.6)",
                              mb: 3,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}
                          >
                            Detalle de Productos
                          </Typography>

                          <List disablePadding>
                            {order.items.map((item, itemIndex) => {
                              const currentOrderRegime =
                                order.taxRegime || globalTaxRegime;
                              const iva =
                                currentOrderRegime === "simplified"
                                  ? 0
                                  : parseFloat(item.product?.iva) || 0;
                              const priceWithTax = Math.round(
                                Number(item.priceAtSale || 0) * (1 + iva / 100),
                              );
                              const subtotalWithTax =
                                priceWithTax * item.quantity;

                              return (
                                <ListItem
                                  key={item._id || itemIndex}
                                  disableGutters
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    py: 2,
                                    borderBottom:
                                      itemIndex < order.items.length - 1
                                        ? "1px solid rgba(255,255,255,0.05)"
                                        : "none",
                                  }}
                                >
                                  {item.product?.imageUrls &&
                                    item.product.imageUrls.length > 0 && (
                                      <Box
                                        sx={{
                                          width: 64,
                                          height: 64,
                                          mr: 2.5,
                                          borderRadius: "12px",
                                          overflow: "hidden",
                                          border:
                                            "1px solid rgba(255,255,255,0.1)",
                                          background: "white",
                                        }}
                                      >
                                        <img
                                          src={
                                            item.product.imageUrls[0].secure_url
                                          }
                                          alt={item.name}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                          }}
                                        />
                                      </Box>
                                    )}
                                  <Box
                                    sx={{
                                      flexGrow: 1,
                                      minWidth: {
                                        xs: "calc(100% - 90px)",
                                        sm: "auto",
                                      },
                                    }}
                                  >
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      {item.name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "rgba(255,255,255,0.5)" }}
                                    >
                                      {item.quantity} x{" "}
                                      {formatPrice(
                                        Number(item.priceAtSale || 0),
                                      )}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: "right", ml: 3 }}>
                                    <Typography
                                      variant="body1"
                                      sx={{ fontWeight: 800 }}
                                    >
                                      {formatPrice(subtotalWithTax)}
                                    </Typography>
                                    <Button
                                      size="small"
                                      startIcon={
                                        <RateReviewIcon sx={{ fontSize: 16 }} />
                                      }
                                      onClick={() =>
                                        navigate(
                                          `/products/${item.product?._id}`,
                                        )
                                      }
                                      sx={{
                                        mt: 1,
                                        color: "#F72585",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        "&:hover": {
                                          background: "rgba(247, 37, 133, 0.1)",
                                        },
                                      }}
                                    >
                                      Calificar
                                    </Button>
                                  </Box>
                                </ListItem>
                              );
                            })}

                            <Box
                              sx={{
                                mt: 3,
                                pt: 3,
                                borderTop: "2px solid rgba(255,255,255,0.1)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ color: "rgba(255,255,255,0.6)" }}
                                >
                                  {(order.taxRegime || globalTaxRegime) ===
                                  "simplified"
                                    ? "Subtotal Productos:"
                                    : "Subtotal Productos (Sin IVA):"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {formatPrice(breakdown.itemsSubtotal)}
                                </Typography>
                              </Box>
                              {(order.taxRegime || globalTaxRegime) !==
                                "simplified" && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "rgba(255,255,255,0.6)" }}
                                  >
                                    IVA Productos (13%):
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {formatPrice(breakdown.itemsTax)}
                                  </Typography>
                                </Box>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ color: "rgba(255,255,255,0.6)" }}
                                >
                                  {(order.taxRegime || globalTaxRegime) ===
                                  "simplified"
                                    ? "Envío:"
                                    : "Envío (Sin IVA):"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {formatPrice(breakdown.shippingBase)}
                                </Typography>
                              </Box>
                              {(order.taxRegime || globalTaxRegime) !==
                                "simplified" && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "rgba(255,255,255,0.6)" }}
                                  >
                                    IVA Envío (13%):
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {formatPrice(breakdown.shippingTax)}
                                  </Typography>
                                </Box>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mt: 1,
                                  pt: 2,
                                  borderTop: "1px dashed rgba(255,255,255,0.2)",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 800 }}
                                >
                                  Total Final:
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 900, color: "#F72585" }}
                                >
                                  {formatPrice(totalFinal)}
                                </Typography>
                              </Box>
                            </Box>
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}
                  >
                    Aún no tienes pedidos registrados.
                  </Typography>
                  <Button
                    onClick={() => navigate("/products")}
                    variant="contained"
                    sx={accentButtonStyle}
                  >
                    Empezar a Comprar
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfilePage;
