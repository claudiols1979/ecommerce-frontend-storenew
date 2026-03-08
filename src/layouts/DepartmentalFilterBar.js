// components/DepartmentalFilterBar.js
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Collapse,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useDepartmental } from "../contexts/DepartmentalContext";
import { useNavigate, useLocation } from "react-router-dom";
import useClickOutside from "../hooks/useClickOutside";

import useScrollDirection from "../hooks/useScrollDirection";

const DepartmentalFilterBar = () => {
  const {
    taxonomy,
    taxonomyLoading,
    searchWithFilters,
    fetchTaxonomy,
    currentFilters,
    departmentalLoading,
    resetSearch,
  } = useDepartmental();

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { isHiding: scrollHiding } = useScrollDirection(15, true);

  const [uiFilters, setUiFilters] = useState({
    department: "",
    brand: "",
    category: "",
    subcategory: "",
  });

  const [activeFilters, setActiveFilters] = useState({});
  const [initialLoad, setInitialLoad] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // Determinar si la barra debe esconderse realmente
  // No se esconde si está expandida o si hay una carga de filtros en curso
  const isHiding = scrollHiding && !expanded && !filterLoading && !departmentalLoading;

  console.log("🔍 Current Filters from Context: ", currentFilters);
  console.log("🎯 UI Filters: ", uiFilters);

  useEffect(() => {
    if (!location.pathname.startsWith("/products")) {
      handleClearAllFilters();
    }
  }, [location.pathname]); // Se ejecuta cada vez que cambia la ruta

  const containerRef = useClickOutside(
    () => {
      if (expanded) {
        setExpanded(false);
      }
    },
    { enabled: expanded },
  );

  // ✅ Cargar taxonomía completa al montar
  useEffect(() => {
    if (initialLoad) {
      fetchTaxonomy({});
      setInitialLoad(false);
    }
  }, [fetchTaxonomy, initialLoad]);

  // ✅ Sincronizar UI filters con currentFilters del contexto
  useEffect(() => {
    if (Object.keys(currentFilters).length > 0) {
      console.log("🔄 Sincronizando UI filters con currentFilters");
      setUiFilters({
        department: currentFilters.department || "",
        brand: currentFilters.brand || "",
        category: currentFilters.category || "",
        subcategory: currentFilters.subcategory || "",
      });
      setActiveFilters(currentFilters);
    }
  }, [currentFilters]);

  const applyFiltersToSearch = useCallback(async () => {
    // No aplicar si está cargando
    if (departmentalLoading) return;

    // Crear filtros no vacíos
    const nonEmptyFilters = Object.fromEntries(
      Object.entries(uiFilters).filter(
        ([_, value]) => value && value.toString().trim() !== "",
      ),
    );

    console.log("🚀 Aplicando filtros seleccionados:", nonEmptyFilters);

    try {
      await searchWithFilters(nonEmptyFilters);
      setActiveFilters(nonEmptyFilters);

      // Navegar a /products si hay filtros y no estamos allí
      if (
        Object.keys(nonEmptyFilters).length > 0 &&
        location.pathname !== "/products"
      ) {
        navigate("/products");
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  }, [
    uiFilters,
    searchWithFilters,
    departmentalLoading,
    location.pathname,
    navigate,
  ]);

  // ✅ Manejar cambio de filtros - SIMPLIFICADO
  const handleFilterChange = async (filterType, value) => {
    const newValue = value.toString().trim();

    console.log(`🔄 Cambiando filtro ${filterType}:`, newValue);

    if (newValue === uiFilters[filterType]) return;

    setFilterLoading(true);

    const newFilters = {
      ...uiFilters,
      [filterType]: newValue,
    };

    // Resetear filtros dependientes
    if (filterType === "department") {
      newFilters.brand = "";
      newFilters.category = "";
      newFilters.subcategory = "";
    } else if (filterType === "brand") {
      newFilters.category = "";
      newFilters.subcategory = "";
    } else if (filterType === "category") {
      newFilters.subcategory = "";
    }

    setUiFilters(newFilters);

    try {
      // Actualizar taxonomía contextual
      const taxonomyFilters = { ...newFilters };
      if (newValue === "") {
        delete taxonomyFilters[filterType];
      }

      await fetchTaxonomy(taxonomyFilters);
      console.log("📊 Taxonomía actualizada");
    } catch (error) {
      console.error("Error loading taxonomy:", error);
    } finally {
      setFilterLoading(false);
    }
  };

  // ✅ Buscar manualmente (botón)
  const handleManualSearch = useCallback(() => {
    console.log("🔍 Búsqueda manual solicitada");
    applyFiltersToSearch();
    setExpanded(false);
  }, [applyFiltersToSearch]);

  // ✅ Limpiar filtro individual
  const handleClearFilter = useCallback(
    async (filterType) => {
      console.log("🧹 Limpiando filtro:", filterType);
      setFilterLoading(true);

      const newFilters = { ...uiFilters, [filterType]: "" };

      // Resetear filtros dependientes
      if (filterType === "department") {
        newFilters.brand = "";
        newFilters.category = "";
        newFilters.subcategory = "";
      } else if (filterType === "brand") {
        newFilters.category = "";
        newFilters.subcategory = "";
      } else if (filterType === "category") {
        newFilters.subcategory = "";
      }

      setUiFilters(newFilters);

      // ✅ ACTUALIZAR activeFilters - ESTO SÍ ES NECESARIO
      setActiveFilters((prev) => {
        const newActiveFilters = { ...prev };
        delete newActiveFilters[filterType];

        // También eliminar filtros dependientes si es necesario
        if (filterType === "department") {
          delete newActiveFilters.brand;
          delete newActiveFilters.category;
          delete newActiveFilters.subcategory;
        } else if (filterType === "brand") {
          delete newActiveFilters.category;
          delete newActiveFilters.subcategory;
        } else if (filterType === "category") {
          delete newActiveFilters.subcategory;
        }

        console.log("✅ Nuevos activeFilters:", newActiveFilters);
        return newActiveFilters;
      });

      try {
        const taxonomyFilters = { ...newFilters };
        delete taxonomyFilters[filterType];
        await fetchTaxonomy(taxonomyFilters);

        // ✅ AQUÍ NECESITO SABER QUÉ FUNCIÓN USAS PARA BUSCAR PRODUCTOS
        // Por ahora, solo actualizo la taxonomía
        console.log("🔍 Filtro limpiado, necesito ejecutar búsqueda aquí");
      } catch (error) {
        console.error("Error clearing filter:", error);
      } finally {
        setFilterLoading(false);
      }
    },
    [uiFilters, fetchTaxonomy],
  ); // ✅ Solo las dependencias que existen

  // ✅ Limpiar todos los filtros
  const handleClearAllFilters = useCallback(async () => {
    console.log("🧹 Limpiando TODOS los filtros");
    setFilterLoading(true);

    const emptyFilters = {
      department: "",
      brand: "",
      category: "",
      subcategory: "",
    };

    setUiFilters(emptyFilters);
    setActiveFilters({});

    try {
      await fetchTaxonomy({});
      resetSearch();
    } catch (error) {
      console.error("Error clearing all filters:", error);
    } finally {
      setFilterLoading(false);
      setExpanded(false);
    }
  }, [fetchTaxonomy, resetSearch]);

  const hasActiveFilters = Object.values(activeFilters).some(
    (value) => value !== "",
  );

  // No bloqueamos los selectores ni el botón mientras carga la taxonomía
  // para evitar el efecto de parpadeo y disabled innecesario.
  const isSearchLoading = departmentalLoading;

  const filteredOptions = useMemo(
    () => ({
      departments: taxonomy.departments || [],
      brands: taxonomy.brands || [],
      categories: taxonomy.categories || [],
      subcategories: taxonomy.subcategories || [],
    }),
    [taxonomy],
  );

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      elevation={0}
      ref={containerRef}
      sx={{
        p: isSmallScreen ? 2 : 3,
        width: isSmallScreen ? "90%" : "40%",
        mx: "auto",
        py: 0.5,
        borderRadius: 2,
        opacity: 0.9,
        background:
          "linear-gradient(30deg, #A855F7 60%, #F72585 100%) !important",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        mt: 0.5,
        mb: 3,
        position: "sticky",
        top: isSmallScreen ? 5 : 180,
        zIndex: 1100,
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s ease, opacity 0.3s ease",
        transform: isHiding ? "translateY(-300px)" : "translateY(0)",
        opacity: isHiding ? 0 : 1,
        visibility: isHiding ? "hidden" : "visible",
        pointerEvents: isHiding ? "none" : "auto",
      }}
    >
      {/* Encabezado del acordeón */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          mb: expanded ? 2 : 0,
        }}
        onClick={toggleExpanded}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FilterListIcon sx={{ color: "rgba(255, 255, 255, 0.8)", mr: 1 }} />
          <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
            Departamentos
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={Object.keys(activeFilters).length}
              size="small"
              onClick={undefined}
              sx={{
                ml: 1,
                backgroundColor: "#bb4343",
                color: "white",
                height: 20,
                "& .MuiChip-label": { px: 1 },
                pointerEvents: "none",
              }}
            />
          )}
        </Box>
        <IconButton size="small" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Grid container spacing={2} alignItems="flex-end">
          {/* Departamento */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <Select
                value={uiFilters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                displayEmpty
                sx={{
                  color: "white",
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                }}
                renderValue={(value) => (value ? value : "Departamento")}
              >
                <MenuItem value="">Todos los departamentos</MenuItem>
                {filteredOptions.departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Marca */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <Select
                value={uiFilters.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
                displayEmpty
                sx={{
                  color: "white",
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
                renderValue={(value) => (value ? value : "Marca")}
              >
                <MenuItem value="">Todas las marcas</MenuItem>
                {filteredOptions.brands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Categoría */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <Select
                value={uiFilters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                displayEmpty
                sx={{
                  color: "white",
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
                renderValue={(value) => (value ? value : "Categoría")}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {filteredOptions.categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Subcategoría */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <Select
                value={uiFilters.subcategory}
                onChange={(e) =>
                  handleFilterChange("subcategory", e.target.value)
                }
                displayEmpty
                sx={{
                  color: "white",
                  borderRadius: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }}
                renderValue={(value) => (value ? value : "Subcategoría")}
              >
                <MenuItem value="">Todas las subcategorías</MenuItem>
                {filteredOptions.subcategories.map((sub) => (
                  <MenuItem key={sub} value={sub}>
                    {sub}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Botón de búsqueda */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleManualSearch}
              disabled={isSearchLoading}
              startIcon={
                isSearchLoading ? <CircularProgress size={16} /> : <SearchIcon />
              }
              sx={{
                height: "40px",
                borderRadius: 2,
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important",
              }}
            >
              {isSearchLoading ? "Cargando..." : "Buscar"}
            </Button>
          </Grid>
        </Grid>

        {/* Chips de Filtros Activos */}
        {hasActiveFilters && (
          <Box
            sx={{
              mt: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
              p: 2,
              borderRadius: 2,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 }}
            >
              Filtros activos:
            </Typography>
            {Object.entries(activeFilters).map(([key, value]) => {
              const labelMap = {
                department: "Departamento",
                brand: "Marca",
                category: "Categoría",
                subcategory: "Subcategoría",
              };

              return (
                <Chip
                  key={key}
                  label={`${labelMap[key]}: ${value}`}
                  onDelete={() => handleClearFilter(key)}
                  size="small"
                  variant="outlined"
                  clickable={false}
                  onClick={undefined}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    pointerEvents: "none",
                    "& .MuiChip-deleteIcon": {
                      pointerEvents: "auto", // Pero permitir eventos en el icono de delete
                    },
                  }}
                />
              );
            })}
            <Button
              size="small"
              onClick={handleClearAllFilters}
              startIcon={<CheckIcon />}
              sx={{ color: "#ffffffff" }}
            >
              Limpiar todos
            </Button>
          </Box>
        )}

      </Collapse>
    </Paper>
  );
};

export default React.memo(DepartmentalFilterBar);