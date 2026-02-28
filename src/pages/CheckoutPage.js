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
  Divider,
  List,
  ListItem,
  Paper,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  InputLabel,
  alpha,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import { useConfig } from "../contexts/ConfigContext";
import { useUpdateInfo } from "../contexts/UpdateInfoContext";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatters";
import { calculatePriceWithTax } from "../utils/taxCalculations";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CRAddressSelector from "../components/CRAddressSelector";

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

const CheckoutPage = () => {
  const { cartItems, loading, initiateTilopayPayment } = useOrders();
  const { user } = useAuth();
  const { taxRegime } = useConfig();
  const { updateResellerProfile } = useUpdateInfo();
  const navigate = useNavigate();
  const theme = useTheme();

  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCanton, setSelectedCanton] = useState("");
  const [selectedDistrito, setSelectedDistrito] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMessage, setShippingMessage] = useState("");
  const [provinceTouched, setProvinceTouched] = useState(false);
  const [paymentButtonLoading, setPaymentButtonLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
    city: false,
    province: false,
  });

  const handleFieldBlur = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const shouldShowError = (fieldName, value) => {
    return touchedFields[fieldName] && !value;
  };

  const totalCartPrice = cartItems.reduce((acc, item) => {
    const priceWithTax = item.product
      ? taxRegime === "simplified"
        ? Math.round(item.priceAtSale)
        : calculatePriceWithTax(item.priceAtSale, item.product.iva)
      : item.priceAtSale;
    return acc + item.quantity * priceWithTax;
  }, 0);

  const finalTotalPrice = totalCartPrice + shippingCost;

  const provinces = [
    "Alajuela",
    "Cartago",
    "Guanacaste",
    "Heredia",
    "Limón",
    "Puntarenas",
    "San José",
  ];

  const GAM_CANTONS = {
    "san jose": [
      "central",
      "escazu",
      "desamparados",
      "aserri",
      "mora",
      "goicoechea",
      "santa ana",
      "alajuelita",
      "vazquez de coronado",
      "tibas",
      "moravia",
      "montes de oca",
      "curridabat",
      "puriscal",
    ],
    alajuela: [
      "central",
      "atenas",
      "grecia",
      "naranjo",
      "palmares",
      "poas",
      "orotina",
      "sarchi",
      "zarcero",
    ],
    cartago: [
      "central",
      "paraiso",
      "la union",
      "jimenez",
      "alvarado",
      "oreamuno",
      "el guarco",
    ],
    heredia: [
      "central",
      "barva",
      "santo domingo",
      "santa barbara",
      "san rafael",
      "san isidro",
      "belen",
      "flores",
      "san pablo",
    ],
  };

  const normalize = (str) =>
    str
      ? str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
      : "";

  const isGAM = (prov, cant) => {
    if (!prov || !cant) return false;
    const nProv = normalize(prov);
    const nCant = normalize(cant);
    const gamProv = GAM_CANTONS[nProv];
    return gamProv ? gamProv.includes(nCant) : false;
  };

  const calculateShippingFee = (prov, cant, items) => {
    if (!prov || !cant) return 0;
    const totalWeight = items.reduce(
      (sum, item) => sum + item.quantity * (item.product?.weight || 100),
      0,
    );
    const inGAM = isGAM(prov, cant);
    const tariffs = [
      { maxW: 250, gam: 1850, resto: 2150 },
      { maxW: 500, gam: 1950, resto: 2500 },
      { maxW: 1000, gam: 2350, resto: 3450 },
    ];
    const rate = tariffs.find((t) => totalWeight <= t.maxW);
    let base = 0;
    if (rate) {
      base = inGAM ? rate.gam : rate.resto;
    } else {
      const base1kg = inGAM ? 2350 : 3450;
      const extraKiloRate = 1100;
      const extraKilos = Math.ceil(totalWeight / 1000 - 1);
      base = base1kg + extraKilos * extraKiloRate;
    }
    return base;
  };

  const [breakdown, setBreakdown] = useState({
    itemsSubtotal: 0,
    itemsTax: 0,
    shippingBase: 0,
    shippingTax: 0,
    total: 0,
  });

  useEffect(() => {
    const iSubtotal = cartItems.reduce(
      (acc, item) => acc + item.quantity * item.priceAtSale,
      0,
    );
    const iTax =
      taxRegime === "simplified"
        ? 0
        : cartItems.reduce((acc, item) => {
          const iva = parseFloat(item.product?.iva) || 0;
          return (
            acc + Math.round(item.quantity * item.priceAtSale * (iva / 100))
          );
        }, 0);
    const currentCanton = selectedCanton || shippingDetails.city;
    const sBaseRaw = calculateShippingFee(
      selectedProvince,
      currentCanton,
      cartItems,
    );
    const sTax = taxRegime === "simplified" ? 0 : Math.round(sBaseRaw * 0.13);
    const sBase =
      taxRegime === "simplified" ? Math.round(sBaseRaw * 1.13) : sBaseRaw;
    setBreakdown({
      itemsSubtotal: iSubtotal,
      itemsTax: iTax,
      shippingBase: sBase,
      shippingTax: sTax,
      total: Math.round(iSubtotal + iTax + sBase + sTax),
    });
    if (selectedProvince && shippingDetails.city) {
      setShippingCost(sBase + sTax);
      setShippingMessage(
        isGAM(selectedProvince, shippingDetails.city)
          ? "Tarifa GAM (EMS Nacional)"
          : "Tarifa Resto del País (EMS Nacional)",
      );
    } else {
      setShippingCost(0);
      setShippingMessage("");
    }
  }, [selectedProvince, selectedCanton, shippingDetails.city, cartItems]);

  useEffect(() => {
    if (!loading && cartItems.length === 0 && !orderPlaced) {
      navigate("/products");
    }
  }, [cartItems, loading, navigate, orderPlaced]);

  useEffect(() => {
    if (user) {
      const fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : "";
      setShippingDetails((prev) => ({
        ...prev,
        name: fullName || prev.name,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city,
      }));
      if (user.provincia || user.province) {
        setSelectedProvince(user.provincia || user.province);
        setProvinceTouched(true);
      }
      if (user.canton || user.city) {
        setSelectedCanton(user.canton || user.city);
      }
      if (user.distrito) {
        setSelectedDistrito(user.distrito);
      }
    }
  }, [user]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const updateUserProfileWithShippingInfo = async () => {
    // FUNCIÓN DESHABILITADA: Los datos ya no se actualizan desde el checkout
    return;
  };

  const handleInitiatePayment = async () => {
    if (!user) {
      setCheckoutError("Debes iniciar sesión para finalizar el pedido.");
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutError("No puedes procesar el pago con un carrito vacío.");
      return;
    }
    if (
      !shippingDetails.name ||
      !shippingDetails.phone ||
      !shippingDetails.address ||
      !shippingDetails.email ||
      !shippingDetails.city ||
      !selectedProvince
    ) {
      setCheckoutError("Por favor, completa toda la información de envío.");
      return;
    }
    setCheckoutError("");
    setPaymentButtonLoading(true);
    try {
      // await updateUserProfileWithShippingInfo(); // Eliminado para no actualizar perfil
      const finalShippingDetails = {
        ...shippingDetails,
        provincia: selectedProvince,
        canton: selectedCanton || shippingDetails.city,
        distrito: selectedDistrito,
        city: selectedCanton || shippingDetails.city,
      };
      const paymentUrl = await initiateTilopayPayment(finalShippingDetails);
      if (paymentUrl) {
        window.location.href = paymentUrl;
      }
    } catch (err) {
      console.error("Error en la página al iniciar el pago:", err);
      setCheckoutError("Hubo un problema al redirigir al pago.");
    } finally {
      setPaymentButtonLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: mainGradient,
          p: 3,
        }}
      >
        <Card
          sx={{
            ...glassStyle,
            maxWidth: 600,
            width: "100%",
            textAlign: "center",
            p: 4,
          }}
        >
          <CheckCircleOutlineIcon
            sx={{ fontSize: 100, color: "#4CAF50", mb: 3 }}
          />
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
            Pedido confirmado
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 4, fontSize: "1.2rem" }}
          >
            Su pedido ha sido procesado exitosamente. Será redirigido al portal
            de pago seguro.
          </Typography>
          {placedOrderDetails && (
            <Box
              sx={{
                mb: 4,
                p: 3,
                background: "rgba(255,255,255,0.05)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ID de pedido: {placedOrderDetails._id}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#F72585", fontWeight: 800 }}
              >
                Total: {formatPrice(placedOrderDetails.totalPrice)}
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            onClick={() => navigate("/profile")}
            sx={{
              borderRadius: "16px",
              px: 4,
              py: 1.5,
              fontWeight: "bold",
              background: "rgba(255,255,255,0.2)",
              "&:hover": { background: "rgba(255,255,255,0.3)" },
            }}
          >
            Ver historial de pedidos
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 8,
        pt: { xs: 4, md: 8 },
        background: mainGradient,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Blur Blobs */}
      <Box
        sx={{
          position: "absolute",
          top: -150,
          right: -150,
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(168, 85, 247, 0) 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(247, 37, 133, 0.35) 0%, rgba(247, 37, 133, 0) 70%)",
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
                    `}
        </style>

        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            mb: 8,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
          className="animate-fade-in-up"
        >
          Finalizar Compra
        </Typography>

        {checkoutError && (
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
            {checkoutError}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Order Summary - LEFT SIDE */}
          <Grid item xs={12} lg={5} className="animate-fade-in-up">
            <Box sx={{ position: "sticky", top: 24 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <ReceiptIcon sx={{ color: "white", mr: 2, fontSize: 32 }} />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "white" }}
                >
                  Resumen del pedido
                </Typography>
              </Box>

              <Card sx={{ ...glassStyle, p: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <List sx={{ mb: 0 }}>
                    {cartItems.map((item, idx) => {
                      const priceWithTax = item.product
                        ? taxRegime === "simplified"
                          ? Math.round(item.priceAtSale)
                          : calculatePriceWithTax(
                            item.priceAtSale,
                            item.product.iva,
                          )
                        : item.priceAtSale;
                      return (
                        <ListItem
                          key={item.product?._id}
                          disablePadding
                          sx={{
                            py: 2,
                            borderBottom:
                              idx === cartItems.length - 1
                                ? "none"
                                : "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Box sx={{ flex: 1, pr: 2 }}>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 700, mb: 0.5 }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.6 }}
                              >
                                {item.quantity} x {formatPrice(priceWithTax)}
                              </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {formatPrice(item.quantity * priceWithTax)}
                            </Typography>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>

                  <Box
                    sx={{
                      my: 3,
                      p: 2,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                    >
                      <LocalShippingIcon
                        sx={{ fontSize: 22, color: "#A855F7", mr: 1.5 }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Costo de envío
                      </Typography>
                    </Box>
                    {!selectedProvince ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 1,
                          p: 1,
                          background: "rgba(255, 152, 0, 0.1)",
                          borderRadius: "8px",
                        }}
                      >
                        <WarningAmberIcon
                          sx={{ fontSize: 18, color: "#FF9800", mr: 1 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "#FF9800", fontWeight: 600 }}
                        >
                          Selecciona ubicación para calcular
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={0.5}
                        >
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            Envío base:
                          </Typography>
                          <Typography variant="body2">
                            {formatPrice(breakdown.shippingBase)}
                          </Typography>
                        </Box>
                        {taxRegime !== "simplified" && (
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={0.5}
                          >
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              IVA (13%):
                            </Typography>
                            <Typography variant="body2">
                              {formatPrice(breakdown.shippingTax)}
                            </Typography>
                          </Box>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#4CAF50",
                            fontWeight: 700,
                            mt: 1,
                            display: "block",
                          }}
                        >
                          {shippingMessage}
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#4CAF50",
                        fontWeight: 600,
                        mt: 1.5,
                        display: "block",
                        lineHeight: 1.4,
                        opacity: 0.9,
                      }}
                    >
                      El envío se gestiona a través de Correos de Costa Rica. El
                      precio es calculado según las tarifas de Correos de Costa
                      Rica tomando en cuenta la dirección del usuario y peso del
                      producto.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      my: 3,
                    }}
                  >
                    {/* Productos */}
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        {taxRegime === "simplified"
                          ? "Subtotal Productos"
                          : "Subtotal Productos (Sin IVA)"}
                        :
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatPrice(breakdown.itemsSubtotal)}
                      </Typography>
                    </Box>

                    {taxRegime !== "simplified" && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          IVA Productos (13%):
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatPrice(breakdown.itemsTax)}
                        </Typography>
                      </Box>
                    )}

                    {/* Envío */}
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        {taxRegime === "simplified"
                          ? "Costo de Envío"
                          : "Envío (Sin IVA)"}
                        :
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatPrice(breakdown.shippingBase)}
                      </Typography>
                    </Box>

                    {taxRegime !== "simplified" && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          IVA Envío (13%):
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatPrice(breakdown.shippingTax)}
                        </Typography>
                      </Box>
                    )}

                    {/* Total */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      sx={{
                        pt: 2,
                        mt: 1,
                        borderTop: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        Total
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 900, color: "white" }}
                      >
                        {formatPrice(breakdown.total)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Shipping Details Form - RIGHT SIDE */}
          <Grid
            item
            xs={12}
            lg={7}
            className="animate-fade-in-up"
            sx={{ animationDelay: "0.2s" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <LocalShippingIcon sx={{ color: "white", mr: 2, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "white" }}>
                Información de envío
              </Typography>
            </Box>

            <Card sx={{ ...glassStyle, mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 3,
                    p: 2,
                    background: "rgba(33, 150, 243, 0.1)",
                    borderRadius: "12px",
                    color: "#90CAF9",
                    border: "1px solid rgba(144, 202, 249, 0.3)",
                  }}
                >
                  * La información de envío se toma de su perfil. Si necesita
                  cambiarla, por favor actualice su perfil antes de completar el
                  pedido.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Nombre completo"
                      name="name"
                      value={shippingDetails.name}
                      onChange={handleShippingChange}
                      onBlur={() => handleFieldBlur("name")}
                      error={shouldShowError("name", shippingDetails.name)}
                      fullWidth
                      required
                      variant="outlined"
                      disabled={true}
                      InputLabelProps={{
                        sx: { color: "rgba(255,255,255,0.7) !important" },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          color: "white",
                          background: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.1)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                        },
                        "& .MuiInputBase-input.Mui-disabled": {
                          color: "white !important",
                          WebkitTextFillColor: "white !important",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Correo electrónico"
                      name="email"
                      type="email"
                      value={shippingDetails.email}
                      onChange={handleShippingChange}
                      onBlur={() => handleFieldBlur("email")}
                      error={shouldShowError("email", shippingDetails.email)}
                      fullWidth
                      required
                      variant="outlined"
                      disabled={true}
                      InputLabelProps={{
                        sx: { color: "rgba(255,255,255,0.7) !important" },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          color: "white",
                          background: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.1)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                        },
                        "& .MuiInputBase-input.Mui-disabled": {
                          color: "white !important",
                          WebkitTextFillColor: "white !important",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Teléfono"
                      name="phone"
                      value={shippingDetails.phone}
                      onChange={handleShippingChange}
                      onBlur={() => handleFieldBlur("phone")}
                      error={shouldShowError("phone", shippingDetails.phone)}
                      fullWidth
                      required
                      variant="outlined"
                      disabled={true}
                      InputLabelProps={{
                        sx: { color: "rgba(255,255,255,0.7) !important" },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          color: "white",
                          background: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.1)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                        },
                        "& .MuiInputBase-input.Mui-disabled": {
                          color: "white !important",
                          WebkitTextFillColor: "white !important",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        "& .MuiInputLabel-root": {
                          color: "rgba(255,255,255,0.7) !important",
                        },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          color: "white",
                          background: "rgba(255,255,255,0.05)",
                          "& fieldset": {
                            borderColor: "rgba(255,255,255,0.1)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                          "& input, & select, & .MuiSelect-select, & .MuiSelect-select.Mui-disabled": {
                            color: "white !important",
                            WebkitTextFillColor: "white !important",
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
                                                   .MuiMenuItem-root:hover { background: rgba(255,255,255,0.1) !important; }
                                                   .Mui-selected { background: rgba(168, 85, 247, 0.3) !important; }
                                               `}
                      </style>
                      <CRAddressSelector
                        provincia={selectedProvince}
                        setProvincia={setSelectedProvince}
                        canton={selectedCanton}
                        setCanton={setSelectedCanton}
                        distrito={selectedDistrito}
                        setDistrito={setSelectedDistrito}
                        icon={null}
                        vertical={false}
                        disabled={true}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <TextField
                  label="Dirección exacta"
                  name="address"
                  value={shippingDetails.address}
                  onChange={handleShippingChange}
                  onBlur={() => handleFieldBlur("address")}
                  error={shouldShowError("address", shippingDetails.address)}
                  fullWidth
                  required
                  variant="outlined"
                  multiline
                  rows={2}
                  disabled={true}
                  InputLabelProps={{
                    sx: { color: "rgba(255,255,255,0.7) !important" },
                  }}
                  sx={{
                    mt: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                      color: "white",
                      background: "rgba(255,255,255,0.05)",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                      "&.Mui-focused fieldset": { borderColor: "#A855F7" },
                    },
                    "& .MuiInputBase-input.Mui-disabled": {
                      color: "white !important",
                      WebkitTextFillColor: "white !important",
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <PaymentIcon sx={{ color: "white", mr: 2, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "white" }}>
                Método de pago
              </Typography>
            </Box>

            <Card sx={glassStyle}>
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    p: 3,
                    background: "rgba(255, 193, 7, 0.1)",
                    border: "2px solid rgba(255, 193, 7, 0.3)",
                    borderRadius: "20px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#FFC107",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <PaymentIcon sx={{ mr: 1.5 }} /> Tarjeta de crédito/débito
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}
                  >
                    Será redirigido a una plataforma de pago segura. Todos los
                    datos están protegidos con encriptación de grado bancario.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleInitiatePayment}
                  disabled={
                    cartItems.length === 0 ||
                    loading ||
                    !shippingDetails.name ||
                    !shippingDetails.phone ||
                    !shippingDetails.address ||
                    !shippingDetails.email ||
                    !selectedProvince ||
                    user?.isBlocked
                  }
                  sx={{
                    mt: 5,
                    py: 2.5,
                    borderRadius: "20px",
                    backgroundColor: "#FFC107 !important",
                    color: "white !important",
                    fontWeight: 900,
                    fontSize: "1.2rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    boxShadow: "0 10px 25px rgba(255, 193, 7, 0.4)",
                    "&:hover": {
                      backgroundColor: "#FFD54F !important",
                      transform: "translateY(-3px)",
                      boxShadow: "0 15px 30px rgba(255, 193, 7, 0.5)",
                    },
                    transition:
                      "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  }}
                >
                  {paymentButtonLoading ? (
                    <CircularProgress size={28} sx={{ color: "white" }} />
                  ) : (
                    "Proceder al pago seguro"
                  )}
                  {!paymentButtonLoading && (
                    <PaymentIcon sx={{ ml: 2, fontSize: 32 }} />
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CheckoutPage;
