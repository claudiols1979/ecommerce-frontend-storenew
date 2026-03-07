import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [randomSeed, setRandomSeed] = useState(() =>
    Math.floor(Math.random() * 1000000),
  );

  const requestVersionRef = useRef(0);
  const isLoadingRef = useRef(false);

  const clearProducts = useCallback(() => {
    setProducts([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalProducts(0);
    setRandomSeed(Math.floor(Math.random() * 1000000));
    requestVersionRef.current += 1; // Invalidate any ongoing request
  }, []);

  const fetchProducts = useCallback(
    async (
      page = 1,
      limit = 18,
      sortOrder = "createdAt_desc",
      searchTerm = "",
      selectedGender = "",
      minPrice = 0,
      maxPrice = 300000,
      groupVariants = true,
    ) => {
      // If page > 1, respect the lock. If page === 1, we always allow (new search)
      if (page > 1 && isLoadingRef.current) return;

      const currentVersion = ++requestVersionRef.current;
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      // Eagerly clear old items to present a clean loading spinner immediately
      if (page === 1) {
        setProducts([]);
      }

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortOrder,
          searchTerm,
          selectedGender,
          minPrice: minPrice.toString(),
          maxPrice: maxPrice.toString(),
          randomSeed: randomSeed.toString(),
          groupVariants: groupVariants.toString(),
          _t: new Date().getTime().toString(),
        }).toString();

        const response = await api.get(`/api/products-filtered?${queryParams}`);

        // Only update state if this is still the most recent request
        if (currentVersion !== requestVersionRef.current) {
          return;
        }

        if (page === 1) {
          setProducts(response.data.products);
        } else {
          setProducts((prevProducts) => [
            ...prevProducts,
            ...response.data.products,
          ]);
        }

        setCurrentPage(response.data.page);
        setTotalPages(response.data.pages);
        setTotalProducts(response.data.totalProducts);
      } catch (err) {
        if (currentVersion !== requestVersionRef.current) return;
        console.error(
          "ProductContext: Error al obtener productos filtrados:",
          err.response?.data || err,
        );
        const errorMessage =
          err.response?.data?.message ||
          "Error al cargar los productos filtrados.";
        setError({ message: errorMessage });
      } finally {
        if (currentVersion === requestVersionRef.current) {
          setLoading(false);
          isLoadingRef.current = false;
        }
      }
    },
    [api, randomSeed],
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      currentPage,
      totalPages,
      totalProducts,
      randomSeed,
      setRandomSeed,
      fetchProducts,
      clearProducts,
    }),
    [
      products,
      loading,
      error,
      currentPage,
      totalPages,
      totalProducts,
      randomSeed,
      fetchProducts,
      clearProducts,
    ],
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProductContext;
