import React, { useState, useEffect, useCallback } from "react";
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
  CardMedia,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import { keyframes } from "@mui/system";
import ProductCard from "../components/product/ProductCard";
import HeroCarousel from "../components/common/HeroCarousel";
import HeroCarouselVideo from "../components/common/HeroCarouselVideo";
import AdGridSystem2 from "../components/common/AdGridSystem2";
import AdGridSystem3 from "../components/common/AdGridSystem3";
import ProductMarqueeSection from "../components/home/ProductMarqueeSection";
import { useProducts } from "../contexts/ProductContext";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import { Helmet } from "react-helmet-async";
import PromotionalBanner from "../components/common/PromotionBanner";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DiscountIcon from "@mui/icons-material/Discount";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SecurityIcon from "@mui/icons-material/Security";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import SearchIcon from "@mui/icons-material/Search";
import ProductFilters from "../components/common/ProductFilters";
import PictureGrid from "../components/common/AdGridSystem";

import AdGridSystem4 from "../components/common/AdGridSystem4";

const FeatureCard = ({ icon, title, description }) => (
  <Box
    sx={{
      p: 3,
      textAlign: "center",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {icon}
    <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
      {description}
    </Typography>
  </Box>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts } = useProducts();
  const { addItemToCart } = useOrders();
  const { user, api } = useAuth();
  const [addingProductId, setAddingProductId] = useState(null);
  const [homeSearchTerm, setHomeSearchTerm] = useState("");
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [novedadesProducts, setNovedadesProducts] = useState([]);
  const [randomRecomendados, setRandomRecomendados] = useState([]);
  const [randomMasVendido, setRandomMasVendido] = useState([]);

  // Fetch products on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch featured products with random sort and grouping (backend-side)
        await fetchProducts(1, 40, "random", "", "", 0, 300000, true);

        // Fetch "Novedades" specifically with chronological sort and grouping
        const response = await api.get("/api/products/public/filtered", {
          params: {
            page: 1,
            limit: 20,
            sortOrder: "createdAt_desc",
            groupVariants: "true",
          },
        });
        setNovedadesProducts(response.data.products || []);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    };

    fetchAllData();
  }, [fetchProducts, api]);

  // Simplify groupedProducts - now it comes directly from context as already grouped
  useEffect(() => {
    if (loading) return;
    setGroupedProducts(products || []);

    // Also distribute to random sections if empty
    if (products.length > 0 && randomRecomendados.length === 0) {
      setRandomRecomendados(products.slice(0, 10));
      setRandomMasVendido(products.slice(10, 20));
    }
  }, [products, loading, randomRecomendados.length]);

  const handleFilterAndNavigate = (filters) => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.gender) {
      params.append("gender", filters.gender);
    }
    if (filters.sort) {
      params.append("sort", filters.sort);
    }

    navigate(`/products?${params.toString()}`);
  };

  // Handler to add items to cart
  const handleAddToCart = useCallback(
    async (product) => {
      if (typeof addItemToCart !== "function") {
        return;
      }

      setAddingProductId(product._id);

      // Price Calculation Logic
      const getPriceForCart = () => {
        let calculatedPrice = null;
        if (
          user &&
          user.role === "Revendedor" &&
          user.resellerCategory &&
          product.resellerPrices
        ) {
          const priceForCategory =
            product.resellerPrices[user.resellerCategory];
          if (typeof priceForCategory === "number" && priceForCategory > 0) {
            calculatedPrice = priceForCategory;
          }
        }
        if (
          calculatedPrice === null &&
          product.resellerPrices &&
          typeof product.resellerPrices.cat1 === "number" &&
          product.resellerPrices.cat1 > 0
        ) {
          calculatedPrice = product.resellerPrices.cat1;
        }
        return calculatedPrice || 0;
      };

      const priceToPass = getPriceForCart();
      if (priceToPass <= 0) {
        setAddingProductId(null);
        return;
      }

      try {
        await addItemToCart(product._id, 1, priceToPass);
      } catch (err) {
        console.error(err);
      } finally {
        setAddingProductId(null);
      }
    },
    [addItemToCart, user],
  );

  // Search handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (homeSearchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(homeSearchTerm)}`);
    }
  };

  // All original data and layout constants remain untouched
  const topWidgetData = [
    {
      title: "Envíos a todo el país",
      description: "Envío seguro con Correos de Costa Rica",
      icon: <LocalShippingIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
    {
      title: "Soporte 24/7",
      description: "Soporte al cliente disponible",
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
    {
      title: "Devolución de Dinero",
      description: "Garantía de devolución total en tus compras",
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
    {
      title: "Descuento en Pedidos",
      description: "Disfruta de ofertas exclusivas y descuentos",
      icon: <DiscountIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
  ];

  const middleWidgetData = [
    {
      title: "Calidad Garantizada",
      description: "Productos seleccionados con los más altos estándares.",
      icon: <SecurityIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
    {
      title: "Innovación Constante",
      description: "Siempre con las últimas tendencias del mercado.",
      icon: <EmojiEventsIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
    {
      title: "Atención Personalizada",
      description: "Un equipo dedicado a tus necesidades y consultas.",
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    },
  ];


  // Swipe Indicator Component for mobile
  const SwipeIndicator = () => (
    <Box
      sx={{
        display: { xs: "flex", sm: "none" },
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        pointerEvents: "none",
        flexDirection: "column",
        alignItems: "center",
        opacity: 0.8,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(4px)",
          animation: "swipeHint 2s infinite",
        }}
      >
        <Typography sx={{ color: "white", fontSize: "1.2rem", fontWeight: "bold" }}>
          →
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          mt: 0.5,
          fontWeight: 700,
          textShadow: "0 1px 2px rgba(255,255,255,0.8)",
        }}
      >
        Desliza
      </Typography>
      <style>
        {`
          @keyframes swipeHint {
            0% { transform: translateX(0); opacity: 0.2; }
            50% { transform: translateX(-10px); opacity: 1; }
            100% { transform: translateX(0); opacity: 0.2; }
          }
        `}
      </style>
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>Oriyina⅃</title>
        <meta
          name="description"
          content="Descubre el catálogo de perfumes y cosméticos en Look & Smell. Accede a precios exclusivos. Envíos a toda Costa Rica."
        />
        <meta
          property="og:title"
          content="Look & Smell - Perfumería Fina en Costa Rica"
        />
        <meta
          property="og:description"
          content="Tu socio de confianza en perfumería y cosméticos. Calidad, variedad y los mejores precios en Costa Rica."
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dl4k0gqfv/image/upload/v1751088623/Gemini_Generated_Image_oscuvxoscuvxoscu_rck3fh.png"
        />
        <meta property="og:url" content="https://www.look-and-smell.com/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Container maxWidth="xl" sx={{ my: 4, flexGrow: 1 }}>
        {/* Hero Carousel - Hidden on mobile, visible on tablet and larger */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <HeroCarousel />
        </Box>

        {/* Top Widgets Section */}
        <Box sx={{ my: 6, textAlign: "center", display: { xs: "none", md: "block" } }}>
          <Grid container spacing={4} justifyContent="center">
            {topWidgetData.map((widget, index) => (
              <Grid item key={index} xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: "transparent",
                    boxShadow: "none",
                    border: "none",
                    borderRadius: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  {widget.icon}
                  <Typography
                    variant="h6"
                    sx={{ mt: 2, fontWeight: 700, color: "primary.main" }}
                  >
                    {widget.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {widget.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ad secion 4 pics in 2x2 frame*/}
        <Box mt={8}>
          <AdGridSystem3 />
          {/* Sección de Grid de Categorías Original (Departamentos) */}
          <PictureGrid />
        </Box>

        {/* Explore All Products Button */}
        <Box sx={{ textAlign: "center", my: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/products")}
            sx={{
              borderRadius: 8,
              px: 5,
              py: 1.5,
              boxShadow: "0 4px 15px rgba(247, 37, 133, 0.4)",
              transition:
                "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
              background:
                "linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 6px 20px rgba(247, 37, 133, 0.6) !important",
                opacity: 0.9,
              },
              "&:active": {
                transform: "translateY(0)",
              },
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            Explorar Todos los Productos
          </Button>
        </Box>

        {/* Featured Products Section */}
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: 700, textAlign: "center" }}
        >
          Nuestros Productos Destacados
        </Typography>
        {loading && groupedProducts.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress color="primary" />
            <Typography ml={2}>Cargando productos...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : groupedProducts.length === 0 ? (
          <Alert severity="info" sx={{ p: 3 }}>
            No hay productos destacados disponibles.
          </Alert>
        ) : (
          <Box sx={{ position: "relative" }}>
            <SwipeIndicator />
            <Box
              sx={{
                display: { xs: "flex", sm: "grid" },
                gridTemplateColumns: {
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(5, 1fr)",
                },
                gap: { xs: 1.5, md: 2 },
                overflowX: { xs: "auto", sm: "visible" },
                scrollSnapType: { xs: "x mandatory", sm: "none" },
                pt: { xs: 5, md: 0 },
                pb: { xs: 5, md: 0 },
                px: { xs: 2, md: 0 },
                mx: { xs: -2, md: 0 },
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                justifyContent: { sm: "center" },
              }}
            >
              {groupedProducts.slice(0, 20).map((product) => (
                <Box
                  key={product._id}
                  sx={{
                    scrollSnapAlign: { xs: "center", sm: "none" },
                    minWidth: { xs: "260px", sm: "auto" },
                    flexShrink: { xs: 0, sm: 1 },
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    isAdding={addingProductId === product._id}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Call to action button */}
        <Box sx={{ textAlign: "center", my: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/products")}
            sx={{
              borderRadius: 8,
              px: 5,
              py: 1.5,
              boxShadow: "0 4px 15px rgba(247, 37, 133, 0.4)",
              transition:
                "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
              background:
                "linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 6px 20px rgba(247, 37, 133, 0.6) !important",
                opacity: 0.9,
              },
              "&:active": {
                transform: "translateY(0)",
              },
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            Explorar Todos los Productos
          </Button>
        </Box>

        {/** Hero Carousel Video**/}
        <HeroCarouselVideo />

        {/* Middle Widgets Section */}
        <Box sx={{ my: 10, px: 2, display: { xs: "none", md: "block" } }}>
          <Grid container spacing={4} justifyContent="center">
            {middleWidgetData.map((widget, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <FeatureCard
                  {...widget}
                  onClick={() => {
                    if (widget.link) {
                      window.open(widget.link, "_blank");
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Ad Grid System 4 */}
        <Box mt={4} mb={8}>
          <AdGridSystem4 />
        </Box>

        {/* Novedades Section  */}
        <ProductMarqueeSection
          title="Novedades"
          products={novedadesProducts}
          onAddToCart={handleAddToCart}
          addingProductId={addingProductId}
          linkTo="/products?sort=createdAt_desc"
        />

        {/* Lo Más Vendido Section */}
        <ProductMarqueeSection
          title="Lo Más Vendido"
          products={randomMasVendido}
          onAddToCart={handleAddToCart}
          addingProductId={addingProductId}
        />

        {/* Recomendados Section */}
        <ProductMarqueeSection
          title="Recomendados Para Ti"
          products={randomRecomendados}
          onAddToCart={handleAddToCart}
          addingProductId={addingProductId}
        />

        <Box mt={4} mb={0}>
          <AdGridSystem2 />
        </Box>

      </Container >
    </>
  );
};

export default HomePage;
