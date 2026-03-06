// components/ProductsPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  const getSearchFromUrl = useCallback(
    () => new URLSearchParams(location.search).get("search") || "",
    [location.search],
  );

  const [searchTerm, setSearchTerm] = useState(getSearchFromUrl());
  const [submittedSearchTerm, setSubmittedSearchTerm] =
    useState(getSearchFromUrl());
  const [selectedGender, setSelectedGender] = useState("");
  const [priceRange, setPriceRange] = useState([0, 300000]);
  const [sortOrder, setSortOrder] = useState("updatedAt_desc");
  const [page, setPage] = useState(1);
  const [addingProductId, setAddingProductId] = useState(null);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [groupingProducts, setGroupingProducts] = useState(false);

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

  // --- FUNCIONES DE AGRUPAMIENTO ---
  const getBaseCode = useCallback((code) => {
    const firstUnderscoreIndex = code.indexOf("_");
    return firstUnderscoreIndex === -1
      ? code
      : code.substring(0, firstUnderscoreIndex);
  }, []);

  const getAttributes = useCallback((code) => {
    const firstUnderscoreIndex = code.indexOf("_");
    if (firstUnderscoreIndex === -1) return [];
    return code.substring(firstUnderscoreIndex + 1).split("_");
  }, []);

  const groupProductsByBase = useCallback(
    (productsToGroup) => {
      const groups = {};
      productsToGroup.forEach((product) => {
        const baseCode = getBaseCode(product.code);
        if (!groups[baseCode]) groups[baseCode] = [];
        groups[baseCode].push({
          ...product,
          attributes: getAttributes(product.code),
        });
      });
      return groups;
    },
    [getBaseCode, getAttributes],
  );

  const selectRepresentativeVariantFromEachGroup = useCallback((grouped) => {
    const displayItems = [];
    for (const baseCode in grouped) {
      const variants = grouped[baseCode];
      // Determinista: siempre elegir la primera variante (que suele ser la base)
      const selectedVariant = variants[0];
      displayItems.push({
        ...selectedVariant,
        baseCode: baseCode,
        variantCount: variants.length,
      });
    }
    return displayItems;
  }, []);

  // --- REINICIO AL MONTAR O CAMBIAR RUTA ---
  useEffect(() => {
    const searchFromUrl = getSearchFromUrl();
    if (
      location.pathname === "/products" &&
      !searchFromUrl &&
      !isDepartmentalMode
    ) {
      console.log("✨ Fresh visit, clearing state...");
      clearProducts();
      setSearchTerm("");
      setSubmittedSearchTerm("");
      setPage(1);
    } else if (searchFromUrl !== submittedSearchTerm) {
      console.log("🔍 Syncing search term from URL:", searchFromUrl);
      clearProducts();
      setSearchTerm(searchFromUrl);
      setSubmittedSearchTerm(searchFromUrl);
      setPage(1);
    }
  }, [
    location.pathname,
    getSearchFromUrl,
    isDepartmentalMode,
    clearProducts,
    submittedSearchTerm,
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

  // --- EFFECT DE AGRUPAMIENTO (DETERMINISTA) ---
  useEffect(() => {
    if (loading && products.length === 0) return;

    if (products && products.length > 0) {
      const validProducts = products.filter((p) => p && p.code);
      if (validProducts.length === 0) {
        setGroupedProducts([]);
        return;
      }

      try {
        setGroupingProducts(true);
        const grouped = groupProductsByBase(validProducts);
        const displayItems = selectRepresentativeVariantFromEachGroup(grouped);
        setGroupedProducts(displayItems);
        setGroupingProducts(false);
      } catch (err) {
        console.error("❌ Error grouping:", err);
        setGroupingProducts(false);
        setGroupedProducts(validProducts); // Fallback
      }
    } else {
      setGroupedProducts([]);
    }
  }, [
    products,
    loading,
    isDepartmentalMode,
    groupProductsByBase,
    selectRepresentativeVariantFromEachGroup,
  ]);

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
                  "linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important",
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
                  "linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important",
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
            <Box
              sx={{
                display: { xs: "flex", md: "grid" },
                gridTemplateColumns: { md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" },
                gap: { xs: 1.5, md: 4 },
                overflowX: { xs: "auto", md: "visible" },
                scrollSnapType: { xs: "x mandatory", md: "none" },
                pb: { xs: 2, md: 0 },
                px: { xs: 2, md: 0 },
                mx: { xs: -2, md: 0 },
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                justifyContent: { md: "center" },
              }}
            >
              {groupedProducts.map((product) => (
                <Box
                  key={product._id}
                  sx={{
                    scrollSnapAlign: { xs: "center", md: "none" },
                    minWidth: { xs: "240px", sm: "300px", md: "auto" },
                    flexShrink: { xs: 0, md: 1 },
                    width: { md: "100%" },
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
