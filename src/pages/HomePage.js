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

// Helper functions para manejar variantes - SIN HARDCORES
const getBaseCode = (code) => {
  const firstUnderscoreIndex = code.indexOf("_");
  return firstUnderscoreIndex === -1
    ? code
    : code.substring(0, firstUnderscoreIndex);
};

// Helper function to extract base name based on attribute count
const extractBaseNameFromAttributes = (productName, productCode) => {
  return productName;
};

// Function to group products by their base product
const groupProductsByBase = (products) => {
  const groups = {};

  products.forEach((product) => {
    const baseCode = getBaseCode(product.code);

    if (!groups[baseCode]) {
      groups[baseCode] = [];
    }

    groups[baseCode].push(product);
  });

  return groups;
};

// Function to select one random variant from each product group
const selectRandomVariantFromEachGroup = (groupedProducts) => {
  const displayProducts = [];

  for (const baseCode in groupedProducts) {
    const variants = groupedProducts[baseCode];

    if (variants.length === 1) {
      const baseName = extractBaseNameFromAttributes(
        variants[0].name,
        variants[0].code,
      );
      displayProducts.push({
        ...variants[0],
        baseCode: baseCode,
        baseName: baseName,
        variantCount: 1,
      });
    } else {
      const randomIndex = Math.floor(Math.random() * variants.length);
      const selectedVariant = variants[randomIndex];

      const baseName = extractBaseNameFromAttributes(
        selectedVariant.name,
        selectedVariant.code,
      );

      displayProducts.push({
        ...selectedVariant,
        baseCode: baseCode,
        baseName: baseName,
        variantCount: variants.length,
      });
    }
  }

  return displayProducts;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts } = useProducts();
  const { addItemToCart } = useOrders();
  const { user } = useAuth();
  const [addingProductId, setAddingProductId] = useState(null);
  const [homeSearchTerm, setHomeSearchTerm] = useState("");
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [randomRecomendados, setRandomRecomendados] = useState([]);
  const [randomMasVendido, setRandomMasVendido] = useState([]);

  // useEffect(() => {
  //   fetchProducts(1, 20, 'createdAt_desc');
  // }, [fetchProducts]);

  // Cambiar el useEffect que carga los productos
  useEffect(() => {
    // Pedir más productos para compensar la agrupación
    // Si quieres 20 productos finales y tienes en promedio 2 variantes por producto,
    // pedir 40 productos (20 * 2)
    const estimatedVariantsPerProduct = 10; // Ajusta este valor según tu caso
    const productsToFetch = 20 * estimatedVariantsPerProduct;

    fetchProducts(1, productsToFetch, "random");
  }, [fetchProducts]);

  // Process products when they change
  useEffect(() => {
    if (products && products.length > 0) {
      const grouped = groupProductsByBase(products);
      const displayProducts = selectRandomVariantFromEachGroup(grouped);
      setGroupedProducts(displayProducts);

      // Select 5 random products for "Recomendados" exactly once when products load
      if (randomRecomendados.length === 0 && displayProducts.length >= 5) {
        const shuffled1 = [...displayProducts].sort(() => 0.5 - Math.random());
        setRandomRecomendados(shuffled1.slice(0, 5));

        // Pick 5 different ones or just re-shuffle for "Lo más vendido"
        const shuffled2 = [...displayProducts].sort(() => 0.5 - Math.random());
        setRandomMasVendido(shuffled2.slice(0, 5));
      } else if (randomRecomendados.length === 0) {
        setRandomRecomendados(displayProducts);
        setRandomMasVendido(displayProducts);
      }
    }
  }, [products]);

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
    {
      title: "Únete a Nuestra Red",
      description: "Forma parte de nuestro selecto grupo de WhatsApp.",
      icon: <GroupAddIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      link: "https://chat.whatsapp.com/KDAzFEvMzpn8MnTBtmntaD",
    },
  ];

  const features = [
    {
      icon: (
        <LocalShippingIcon sx={{ fontSize: 40, color: "secondary.main" }} />
      ),
      title: "Envío Rápido",
      description: "Entregas eficientes y seguras a todo el país.",
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      title: "Soporte 24/7",
      description: "Atención personalizada para todas tus dudas.",
    },
    {
      icon: <StorefrontIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      title: "Amplio Catálogo",
      description: "Cientos de productos para todos tus gustos.",
    },
  ];

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

      {/* <Container maxWidth="xl" sx={{ my: 1 }}>
        <ProductFilters onFilterSubmit={handleFilterAndNavigate} />
      </Container> */}

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
          <Box
            sx={{
              display: { xs: "flex", md: "grid" },
              gridTemplateColumns: { md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" },
              gap: { xs: 1.5, md: 2 },
              overflowX: { xs: "auto", md: "visible" },
              scrollSnapType: { xs: "x mandatory", md: "none" },
              pt: { xs: 5, md: 0 },
              pb: { xs: 5, md: 0 },
              px: { xs: 2, md: 0 },
              mx: { xs: -2, md: 0 },
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              justifyContent: { md: "center" },
            }}
          >
            {groupedProducts.slice(0, 20).map((product) => (
              <Box
                key={product._id}
                sx={{
                  scrollSnapAlign: { xs: "center", md: "none" },
                  minWidth: { xs: "260px", sm: "300px", md: "auto" },
                  flexShrink: { xs: 0, md: 1 },
                  width: { md: "100%" },
                }}
              >
                <ProductCard
                  product={{
                    ...product,
                    name: product.baseName || product.name,
                    variantCount: product.variantCount,
                  }}
                  onAddToCart={() => handleAddToCart(product)}
                  isAdding={addingProductId === product._id}
                />
              </Box>
            ))}
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
        <Box sx={{ my: 8, textAlign: "center", display: { xs: "none", md: "block" } }}>
          <Grid container spacing={4} justifyContent="center">
            {middleWidgetData.map((widget, index) => (
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
                    cursor: widget.link ? "pointer" : "default",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: widget.link ? "translateY(-5px)" : "none",
                    },
                  }}
                  onClick={() => {
                    if (widget.link) {
                      window.open(widget.link, "_blank");
                    }
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

        {/* "Why Choose Us" Section */}
        <Box
          sx={{
            my: 8,
            textAlign: "center",
            bgcolor: "background.default",
            color: "text.primary",
            p: { xs: 4, sm: 6 },
            borderRadius: 3,
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            display: { xs: "none", md: "block" },
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 4, fontWeight: 700, color: "primary.main" }}
          >
            Por Qué Elegirnos
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                  }}
                >
                  {feature.icon}
                  <Typography
                    variant="h6"
                    sx={{ mt: 2, fontWeight: 600, color: "primary.main" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Novedades Section  */}
        <ProductMarqueeSection
          title="Novedades"
          products={groupedProducts.slice(0, 5)}
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
