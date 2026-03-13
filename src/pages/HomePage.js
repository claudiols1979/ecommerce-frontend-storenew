import React, { useState, useEffect, useCallback, useRef } from "react";
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
import HomeDepartmentalSections from "../components/home/HomeDepartmentalSections";
import { useProducts } from "../contexts/ProductContext";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import { Helmet } from "react-helmet-async";
import PromotionalBanner from "../components/common/PromotionBanner";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import SearchIcon from "@mui/icons-material/Search";
import ProductFilters from "../components/common/ProductFilters";
import PictureGrid from "../components/common/AdGridSystem";

import AdGridSystem4 from "../components/common/AdGridSystem4";



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
  const featuredScrollRef = useRef(null);

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
      setRandomMasVendido(products.slice(10, 20));
    }

    // Reset scroll position when products change (mobile)
    if (featuredScrollRef.current) {
      featuredScrollRef.current.scrollLeft = 0;
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
          ←
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
        <title>Oriyina⅃ | Original como vos!</title>
        <meta
          name="description"
          content="Descubre el catálogo de perfumes y cosméticos en Oriyina⅃. Accede a precios exclusivos. Envíos a toda Costa Rica."
        />
        <meta
          property="og:title"
          content="Oriyina⅃ - Perfumería Fina en Costa Rica"
        />
        <meta
          property="og:description"
          content="Tu socio de confianza en perfumería y cosméticos. Calidad, variedad y los mejores precios en Costa Rica."
        />
        <meta
          property="og:image"
          content="https://www.oriyinal.com/favicon.png"
        />
        <meta name="twitter:card" content="summary" />
        <meta property="og:url" content="https://www.oriyinal.com/" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Container maxWidth="xl" sx={{ mt: 0, mb: 4, flexGrow: 1 }}>
        {/* Ad Section 3 - Now at the top */}
        <Box mt={0}>
          <AdGridSystem3 />
        </Box>
        
        {/* Sección de Grid de Categorías Original (Departamentos) */}
        <Box mt={6}>
          <PictureGrid />
        </Box>

        {/* Explore All Products Button */}
        {/* <Box sx={{ textAlign: "center", my: 6 }}>
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
        </Box> */}

        {/* Featured Products Section */}
        <Typography
          variant="h5"
          sx={{ mb: 3, mt: 3,fontWeight: 700, textAlign: "center" }}
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
              ref={featuredScrollRef}
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
                scrollBehavior: "smooth",
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

        {/* Hero Carousel - Now positioned above the bottom Explore button */}
        <Box sx={{ display: { xs: "none", sm: "block" }, my: 4 }}>
          <HeroCarousel />
        </Box>

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
              "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 10%, rgba(49, 0, 138, 0.85) 55%, rgba(168, 85, 247, 0.85) 85%, rgba(247, 37, 133, 0.85) 100%) !important",
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

        {/* Dynamic Departmental Sections */}
        <HomeDepartmentalSections
          onAddToCart={handleAddToCart}
          addingProductId={addingProductId}
        />



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
