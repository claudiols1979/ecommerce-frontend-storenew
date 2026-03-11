// components/ProductsPage.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import { useProducts } from "../contexts/ProductContext";
import { useDepartmental } from "../contexts/DepartmentalContext";
import { useTheme } from "@mui/material/styles";
import { Helmet } from "react-helmet-async";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";

const ProductsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // --- CONTEXTOS ---
  const {
    products: standardProducts,
    loading: standardLoading,
    error: standardError,
    fetchProducts,
    clearProducts,
    currentPage,
    totalPages,
  } = useProducts();

  const {
    departmentalProducts,
    departmentalLoading,
    departmentalError,
    departmentalHasMore,
    fetchDepartmentalProducts,
    currentFilters,
    resetSearch,
  } = useDepartmental();

  const { addItemToCart } = useOrders();
  const { user } = useAuth();

  // --- MODO DE VISUALIZACIÓN ---
  const isDepartmentalMode = useMemo(
    () => Object.keys(currentFilters).length > 0,
    [currentFilters],
  );

  const products = isDepartmentalMode ? departmentalProducts : standardProducts;
  const loading = isDepartmentalMode ? departmentalLoading : standardLoading;
  const error = isDepartmentalMode ? departmentalError : standardError;
  const hasMore = isDepartmentalMode
    ? departmentalHasMore
    : currentPage < totalPages;

  // --- ESTADOS DE FILTRADO ---
  const getParamsFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const stripQuotes = (val) => {
      if (!val) return "";
      // Strip literal double quotes if they surround the value
      return val.replace(/^"|"$/g, "");
    };

    return {
      search: stripQuotes(params.get("search")),
      department: stripQuotes(params.get("department")),
      category: stripQuotes(params.get("category")),
      brand: stripQuotes(params.get("brand")),
      subcategory: stripQuotes(params.get("subcategory")),
    };
  }, [location.search]);

  const initialParams = useMemo(() => getParamsFromUrl(), [getParamsFromUrl]);

  const [searchTerm, setSearchTerm] = useState(initialParams.search);
  const [submittedSearchTerm, setSubmittedSearchTerm] =
    useState(initialParams.search);
  const [selectedGender, setSelectedGender] = useState("");
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [sortOrder, setSortOrder] = useState("random");
  const [page, setPage] = useState(1);
  const [addingProductId, setAddingProductId] = useState(null);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [groupingProducts, setGroupingProducts] = useState(false);
  const productsScrollRef = useRef(null);

  const availableGenders = useMemo(
    () => [
      { value: "men", label: "Hombre" },
      { value: "women", label: "Mujer" },
      { value: "unisex", label: "Unisex" },
      { value: "children", label: "Niños" },
      { value: "elderly", label: "Ancianos" },
      { value: "other", label: "Otro" },
    ],
    [],
  );

  // --- REINICIO AL MONTAR O CAMBIAR RUTA ---
  useEffect(() => {
    const paramsFromUrl = getParamsFromUrl();
    const hasDeptParams = paramsFromUrl.department || paramsFromUrl.category || paramsFromUrl.brand || paramsFromUrl.subcategory;

    if (
      location.pathname === "/products" &&
      !paramsFromUrl.search &&
      !hasDeptParams &&
      !isDepartmentalMode
    ) {
      console.log("✨ Fresh visit, clearing state...");
      clearProducts();
      setSearchTerm("");
      setSubmittedSearchTerm("");
      setPage(1);
    } else if (paramsFromUrl.search !== submittedSearchTerm) {
      console.log("🔍 Syncing search term from URL:", paramsFromUrl.search);
      clearProducts();
      setSearchTerm(paramsFromUrl.search);
      setSubmittedSearchTerm(paramsFromUrl.search);
      setPage(1);
    }

    // Si hay parámetros de departamento en la URL, los inyectamos en el contexto
    if (hasDeptParams) {
      const deptFiltersFromUrl = {
        department: paramsFromUrl.department,
        category: paramsFromUrl.category,
        brand: paramsFromUrl.brand,
        subcategory: paramsFromUrl.subcategory
      };

      // Limpiar filtros vacíos
      const cleanUrlFilters = Object.fromEntries(
        Object.entries(deptFiltersFromUrl).filter(([_, v]) => v !== "")
      );

      // Solo actualizamos si son diferentes a los actuales para evitar bucles
      if (JSON.stringify(cleanUrlFilters) !== JSON.stringify(currentFilters)) {
        console.log("📂 Syncing departmental filters from URL:", cleanUrlFilters);
        fetchDepartmentalProducts(cleanUrlFilters, 1);
      }
    }
  }, [
    location.pathname,
    getParamsFromUrl,
    isDepartmentalMode,
    clearProducts,
    submittedSearchTerm,
    currentFilters,
    fetchDepartmentalProducts
  ]);

  // --- EFFECT DE CARGA DE DATOS ---
  useEffect(() => {
    const limit = 80;
    if (isDepartmentalMode) {
      fetchDepartmentalProducts(currentFilters, page, limit);
    } else {
      fetchProducts(
        page,
        limit,
        sortOrder,
        submittedSearchTerm,
        selectedGender,
        priceRange[0],
        priceRange[1],
      );
    }
  }, [
    page,
    isDepartmentalMode,
    sortOrder,
    submittedSearchTerm,
    selectedGender,
    priceRange,
    fetchProducts,
    fetchDepartmentalProducts,
    currentFilters,
  ]);

  // --- EFFECT DE AGRUPAMIENTO (SIMPLIFICADO - AHORA VIENE DEL BACKEND) ---
  useEffect(() => {
    if (loading && products.length === 0) return;
    setGroupedProducts(products || []);

    // Reset scroll position when products change (mobile)
    if (productsScrollRef.current) {
      productsScrollRef.current.scrollLeft = 0;
    }
  }, [products, loading]);

  // --- SCROLL INFINITO ---
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop <
      document.documentElement.offsetHeight - 500 ||
      loading
    )
      return;
    if (hasMore) setPage((prev) => prev + 1);
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // --- HANDLERS ---
  const handleAddToCart = useCallback(
    async (product) => {
      if (typeof addItemToCart !== "function") return;
      setAddingProductId(product._id);

      let priceToPass = 0;
      if (
        user &&
        user.role === "Revendedor" &&
        user.resellerCategory &&
        product.resellerPrices
      ) {
        priceToPass =
          product.resellerPrices[user.resellerCategory] ||
          product.resellerPrices.cat1 ||
          0;
      } else if (product.resellerPrices) {
        priceToPass = product.resellerPrices.cat1 || 0;
      }

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

  const handleClearSearch = () => {
    setSearchTerm("");
    setSubmittedSearchTerm("");
    setSelectedGender("");
    navigate("/products", { replace: true });
  };

  const handleClearDepartmentalFilters = () => {
    resetSearch();
    navigate("/products", { replace: true });
  };

  const shouldShowNoProductsMessage =
    !loading &&
    !groupingProducts &&
    groupedProducts.length === 0 &&
    (isDepartmentalMode || submittedSearchTerm || selectedGender);

  const getNoProductsMessage = () => {
    if (isDepartmentalMode)
      return "No se encontraron productos con estos filtros.";
    if (submittedSearchTerm)
      return `No hay resultados para "${submittedSearchTerm}".`;
    return "No hay productos disponibles.";
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
        <title>Catálogo - Oriyina⅃</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ my: 1, flexGrow: 1 }}>
        {submittedSearchTerm && !isDepartmentalMode && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleClearSearch}
              sx={{
                color: "white",
                background:
              "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 10%, rgba(49, 0, 138, 0.85) 55%, rgba(168, 85, 247, 0.85) 85%, rgba(247, 37, 133, 0.85) 100%) !important",
                borderRadius: 10,
              }}
            >
              Mostrar Todos los Productos
            </Button>
          </Box>
        )}

        {isDepartmentalMode && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleClearDepartmentalFilters}
              sx={{
                color: "white",
                background:
              "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 10%, rgba(49, 0, 138, 0.85) 55%, rgba(168, 85, 247, 0.85) 85%, rgba(247, 37, 133, 0.85) 100%) !important",
                borderRadius: 10,
              }}
            >
              Mostrar Todos los Productos
            </Button>
          </Box>
        )}

        {(loading || groupingProducts) && groupedProducts.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : shouldShowNoProductsMessage ? (
          <Alert severity="info">{getNoProductsMessage()}</Alert>
        ) : (
          <>
            <Box sx={{ position: "relative" }}>
              <SwipeIndicator />
              <Box
                ref={productsScrollRef}
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
                  pb: { xs: 2, md: 0 },
                  px: { xs: 2, md: 0 },
                  mx: { xs: -2, md: 0 },
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  justifyContent: { sm: "center" },
                }}
              >
                {groupedProducts.map((product) => (
                  <Box
                    key={product._id}
                    sx={{
                      scrollSnapAlign: { xs: "center", sm: "none" },
                      minWidth: { xs: "240px", sm: "auto" },
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
            {loading && products.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </>
        )}
      </Container >
    </>
  );
};

export default ProductsPage;
