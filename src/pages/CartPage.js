import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link as MuiLink,
  Divider,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CodeIcon from "@mui/icons-material/Code";
import CategoryIcon from "@mui/icons-material/Category";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import { useConfig } from "../contexts/ConfigContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatters";
import { calculatePriceWithTax } from "../utils/taxCalculations";

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

const CartPage = () => {
  const theme = useTheme();
  const {
    cartItems,
    loading,
    error,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = useOrders();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { taxRegime } = useConfig();

  const [confirmClearCartOpen, setConfirmClearCartOpen] = useState(false);

  // Calcular el total del carrito con IVA incluido
  const totalCartPrice = cartItems.reduce((acc, item) => {
    const priceWithTax = item.product
      ? taxRegime === "simplified"
        ? Math.round(item.priceAtSale)
        : calculatePriceWithTax(item.priceAtSale, item.product.iva)
      : item.priceAtSale;
    return acc + item.quantity * priceWithTax;
  }, 0);

  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      console.log("Tu carrito está vacío. ¡Añade algunos productos!");
    }
  }, [cartItems, loading]);

  const handleQuantityChange = async (item, changeType) => {
    const productId = item.product?._id;
    if (!productId) return;

    const totalAvailableStock =
      (item.product?.countInStock || 0) + item.quantity;
    let newQuantity;
    if (changeType === "increment") {
      newQuantity = item.quantity + 1;
      if (newQuantity > totalAvailableStock) {
        toast.warn(
          `No puedes agregar más. Stock máximo: ${totalAvailableStock} unidades.`,
        );
        return;
      }
    } else if (changeType === "decrement") {
      newQuantity = item.quantity - 1;
      if (newQuantity < 1) newQuantity = 1;
    } else {
      newQuantity = parseInt(changeType, 10);
      if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
      if (newQuantity > totalAvailableStock) {
        toast.warn(
          `El stock máximo es ${totalAvailableStock}. Se ajustó la cantidad.`,
        );
        newQuantity = totalAvailableStock;
      }
    }

    if (newQuantity !== item.quantity) {
      await updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (item) => {
    const productId = item.product?._id;
    if (productId) {
      await removeCartItem(productId);
    }
  };

  const confirmClearCart = async () => {
    setConfirmClearCartOpen(false);
    await clearCart();
  };

  if (error) {
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
        <Card sx={glassStyle}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Alert severity="error" sx={{ borderRadius: "16px", mb: 2 }}>
              {error.message}
            </Alert>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {" "}
              Reintentar{" "}
            </Button>
          </CardContent>
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
          `}
        </style>

        <Typography
          variant="h3"
          gutterBottom
          className="animate-fade-in-up"
          sx={{
            textAlign: "center",
            mb: 6,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          Tu Carrito de Compras
        </Typography>

        {user?.isBlocked && (
          <Alert
            severity="error"
            className="animate-fade-in-up"
            sx={{
              mb: 4,
              borderRadius: "16px",
              background: "rgba(211, 47, 47, 0.2)",
              color: "#ffcdd2",
              border: "1px solid rgba(211, 47, 47, 0.3)",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Su cuenta se encuentra restringida para realizar compras. Por
              favor, contacte al administrador.
            </Typography>
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <Card
            className="animate-fade-in-up"
            sx={{ ...glassStyle, p: { xs: 4, sm: 8 }, textAlign: "center" }}
          >
            <ShoppingBagIcon sx={{ fontSize: 80, mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
              Tu carrito está vacío
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/products")}
              sx={{
                background: "linear-gradient(90deg, #A855F7 0%, #F72585 100%)",
                borderRadius: "16px",
                px: 6,
                py: 2,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1.1rem",
                boxShadow: "0 10px 20px rgba(247, 37, 133, 0.3)",
              }}
            >
              Explorar Productos
            </Button>
          </Card>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8} className="animate-fade-in-up">
              <Card sx={glassStyle}>
                <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
                  {cartItems.map((item, index) => {
                    const priceWithTax = item.product
                      ? taxRegime === "simplified"
                        ? Math.round(item.priceAtSale)
                        : calculatePriceWithTax(
                            item.priceAtSale,
                            item.product.iva,
                          )
                      : item.priceAtSale;
                    const totalAvailableStock =
                      (item.product?.countInStock || 0) + item.quantity;

                    return (
                      <Box
                        key={item.product?._id || item._id}
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          alignItems: "center",
                          mb: index === cartItems.length - 1 ? 0 : 4,
                          pb: index === cartItems.length - 1 ? 0 : 4,
                          borderBottom:
                            index === cartItems.length - 1
                              ? "none"
                              : "1px solid rgba(255,255,255,0.1)",
                          gap: { xs: 2, sm: 3 },
                        }}
                      >
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            p: 1.5,
                            background: "white",
                            borderRadius: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                          }}
                        >
                          <Box
                            component="img"
                            src={
                              item.image ||
                              "https://placehold.co/100x100/E0E0E0/FFFFFF?text=No+Image"
                            }
                            alt={item.name}
                            sx={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>

                        <Box
                          sx={{
                            flexGrow: 1,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              mb: 0.5,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              justifyContent: {
                                xs: "center",
                                sm: "flex-start",
                              },
                              mb: 1,
                              opacity: 0.7,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <CodeIcon sx={{ fontSize: 14, mr: 0.5 }} />{" "}
                              {item.code}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <CategoryIcon sx={{ fontSize: 14, mr: 0.5 }} />{" "}
                              {item.product?.volume || "N/A"}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{ color: "#F72585", fontWeight: 800 }}
                          >
                            {formatPrice(priceWithTax)}
                            {taxRegime !== "simplified" && (
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{ ml: 1, opacity: 0.6 }}
                              >
                                IVA incl.
                              </Typography>
                            )}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "12px",
                            p: 0.5,
                          }}
                        >
                          <IconButton
                            onClick={() =>
                              handleQuantityChange(item, "decrement")
                            }
                            disabled={item.quantity <= 1}
                            sx={{
                              color: "white",
                              "&:hover": {
                                background: "rgba(255,255,255,0.1)",
                              },
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography
                            sx={{
                              minWidth: "2ch",
                              textAlign: "center",
                              fontWeight: 800,
                              fontSize: "1.2rem",
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            onClick={() =>
                              handleQuantityChange(item, "increment")
                            }
                            disabled={item.quantity >= totalAvailableStock}
                            sx={{
                              color: "white",
                              "&:hover": {
                                background: "rgba(255,255,255,0.1)",
                              },
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Box
                          sx={{
                            minWidth: 100,
                            textAlign: { xs: "center", sm: "right" },
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {formatPrice(item.quantity * priceWithTax)}
                          </Typography>
                          <Button
                            startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                            onClick={() => handleRemoveItem(item)}
                            color="error"
                            size="small"
                            sx={{
                              mt: 1,
                              textTransform: "none",
                              opacity: 0.7,
                              "&:hover": { opacity: 1 },
                            }}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              className="animate-fade-in-up"
              sx={{ animationDelay: "0.2s" }}
            >
              <Card sx={{ ...glassStyle, position: "sticky", top: 20 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 800, mb: 4 }}
                  >
                    Resumen de Compra
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ opacity: 0.7 }}>
                        {taxRegime === "simplified"
                          ? "Subtotal"
                          : "Subtotal bruto"}
                        :
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {formatPrice(totalCartPrice)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ opacity: 0.7 }}>Envío:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontStyle: "italic", opacity: 0.5 }}
                      >
                        Por calcular
                      </Typography>
                    </Box>
                  </Box>

                  <Divider
                    sx={{ mb: 3, borderColor: "rgba(255,255,255,0.1)" }}
                  />

                  <Box display="flex" justifyContent="space-between" mb={4}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Total
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 900, color: "white" }}
                    >
                      {formatPrice(totalCartPrice)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 2,
                      py: 2,
                      borderRadius: "16px",
                      backgroundColor: "#FFC107 !important", // Keep existing yellow
                      color: "white !important", // Bold white text as requested
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      boxShadow: "0 10px 25px rgba(255, 193, 7, 0.4)",
                      "&:hover": {
                        backgroundColor: "#FFD54F !important",
                        transform: "translateY(-2px)",
                        boxShadow: "0 15px 30px rgba(255, 193, 7, 0.5)",
                      },
                      transition:
                        "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    }}
                    onClick={() => navigate("/checkout")}
                    disabled={
                      cartItems.length === 0 || loading || user?.isBlocked
                    }
                  >
                    {user?.isBlocked
                      ? "Acción Restringida"
                      : "Proceder al Checkout"}
                  </Button>

                  <Button
                    fullWidth
                    onClick={() => navigate("/products")}
                    sx={{
                      mt: 2,
                      color: "white",
                      opacity: 0.6,
                      textTransform: "none",
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    Continuar Comprando
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Confirmation Dialog for Clear Cart */}
      <Dialog
        open={confirmClearCartOpen}
        onClose={() => setConfirmClearCartOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>¿Vaciar carrito?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            ¿Estás seguro de que deseas eliminar todos los productos de tu
            carrito?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setConfirmClearCartOpen(false)}
            sx={{ fontWeight: 700, color: "text.secondary" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmClearCart}
            color="error"
            variant="contained"
            sx={{ borderRadius: "12px", px: 3, fontWeight: 700 }}
          >
            Vaciar Todo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CartPage;
