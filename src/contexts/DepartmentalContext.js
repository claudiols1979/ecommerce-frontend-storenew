// contexts/DepartmentalContext.js
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const DepartmentalContext = createContext();

export const useDepartmental = () => useContext(DepartmentalContext);

export const DepartmentalProvider = ({ children }) => {
  const { api } = useAuth();
  const navigate = useNavigate();

  // Estados para productos departamentales
  const [departmentalProducts, setDepartmentalProducts] = useState([]);
  const [departmentalLoading, setDepartmentalLoading] = useState(false);
  const [departmentalError, setDepartmentalError] = useState(null);
  const [departmentalHasMore, setDepartmentalHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState({});
  const [randomSeed, setRandomSeed] = useState(() =>
    Math.floor(Math.random() * 1000000),
  );

  // Ref para evitar peticiones concurrentes/infinitas
  const requestVersionRef = useRef(0);
  const isLoadingRef = useRef(false);

  // Estado para taxonomía
  const [taxonomy, setTaxonomy] = useState({
    departments: [],
    brands: [],
    categories: [],
    subcategories: [],
  });
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);

  // Función para obtener taxonomía contextual
  const fetchTaxonomy = useCallback(
    async (filters = {}) => {
      try {
        setTaxonomyLoading(true);
        console.log("📋 Solicitando taxonomía con filtros:", filters);

        const params = {};
        if (filters.department) params.department = filters.department;
        if (filters.brand) params.brand = filters.brand;
        if (filters.category) params.category = filters.category;
        if (filters.subcategory) params.subcategory = filters.subcategory;

        const response = await api.get("/api/products/public/taxonomy", {
          params: Object.keys(params).length > 0 ? params : undefined,
        });

        console.log("📦 Respuesta de taxonomía:", response.data);
        setTaxonomy(response.data.data);
      } catch (err) {
        console.error("❌ Error al obtener taxonomía:", err);
        setTaxonomy({
          departments: [],
          brands: [],
          categories: [],
          subcategories: [],
        });
      } finally {
        setTaxonomyLoading(false);
      }
    },
    [api],
  );

  // Función principal para obtener productos
  const fetchDepartmentalProducts = useCallback(
    async (filters = {}, page = 1, limit = 18, sortOrder = "random", groupVariants = true) => {
      // If page > 1, respect the lock. If page === 1, we always allow (new search)
      if (page > 1 && isLoadingRef.current) return;

      const currentVersion = ++requestVersionRef.current;
      isLoadingRef.current = true;
      setDepartmentalLoading(true);
      setDepartmentalError(null);

      // Eagerly clear old items to present a clean loading spinner immediately
      if (page === 1) {
        setDepartmentalProducts([]);
      }

      try {
        const params = {
          limit: limit.toString(),
          page: page.toString(),
          sortOrder,
          randomSeed: randomSeed.toString(),
          groupVariants: groupVariants.toString(),
          ...filters,
        };

        // Limpiar parámetros vacíos
        Object.keys(params).forEach((key) => {
          if (
            params[key] === null ||
            params[key] === undefined ||
            params[key] === ""
          ) {
            delete params[key];
          }
        });

        console.log("🚀 Fetching products with params:", params);
        const response = await api.get("/api/products/public/filtered", {
          params,
        });

        // Only update state if this is still the most recent request
        if (currentVersion !== requestVersionRef.current) {
          return;
        }

        // ✅ Manejo correcto de la paginación
        if (page === 1) {
          setDepartmentalProducts(response.data.products);
        } else {
          setDepartmentalProducts((prev) => [
            ...prev,
            ...response.data.products,
          ]);
        }

        setDepartmentalHasMore(page < response.data.pages);
        setCurrentPage(page);
        setCurrentFilters(filters);

        console.log(
          `📊 Página ${page} cargada. Productos: ${response.data.products.length}, ¿Hay más?: ${page < response.data.pages}`,
        );
      } catch (err) {
        if (currentVersion !== requestVersionRef.current) return;
        console.error("Error al obtener productos departamentales:", err);
        const errorMessage =
          err.response?.data?.message || "Error al cargar los productos.";
        setDepartmentalError({ message: errorMessage });
      } finally {
        if (currentVersion === requestVersionRef.current) {
          setDepartmentalLoading(false);
          isLoadingRef.current = false;
        }
      }
    },
    [api, randomSeed],
  );

  // ✅ Función para cargar más productos
  const loadMoreProducts = useCallback(() => {
    const nextPage = currentPage + 1;
    console.log(`⬇️ Cargando página ${nextPage}...`);
    fetchDepartmentalProducts(currentFilters, nextPage);
  }, [fetchDepartmentalProducts, currentFilters, currentPage]);

  // ✅ Función para buscar con nuevos filtros
  const searchWithFilters = useCallback(
    (filters) => {
      console.log(`🔍 Nueva búsqueda con filtros:`, filters);
      fetchDepartmentalProducts(filters, 1);
    },
    [fetchDepartmentalProducts],
  );

  // ✅ Función para reiniciar búsqueda
  const resetSearch = useCallback(() => {
    console.log("🔄 Reiniciando búsqueda...");
    setDepartmentalProducts([]);
    setCurrentPage(1);
    setDepartmentalHasMore(false);
    setCurrentFilters({});
    setRandomSeed(Math.floor(Math.random() * 1000000));
  }, []);

  const value = useMemo(
    () => ({
      departmentalProducts,
      departmentalLoading,
      departmentalError,
      departmentalHasMore,
      currentPage,
      fetchDepartmentalProducts,
      loadMoreProducts,
      searchWithFilters,
      resetSearch,
      taxonomy,
      taxonomyLoading,
      fetchTaxonomy,
      currentFilters,
      setCurrentFilters,
      randomSeed,
      setRandomSeed,
    }),
    [
      departmentalProducts,
      departmentalLoading,
      departmentalError,
      departmentalHasMore,
      currentPage,
      fetchDepartmentalProducts,
      loadMoreProducts,
      searchWithFilters,
      resetSearch,
      taxonomy,
      taxonomyLoading,
      fetchTaxonomy,
      currentFilters,
      randomSeed,
    ],
  );

  return (
    <DepartmentalContext.Provider value={value}>
      {children}
    </DepartmentalContext.Provider>
  );
};

DepartmentalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DepartmentalContext;
