// contexts/SearchContext.js
import React, { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axios from "axios";
import API_URL from "../config"; // Asegúrate de tener tu config

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lastSearchTerm, setLastSearchTerm] = useState("");

  // Crear instancia de axios sin autenticación
  const api = axios.create({
    baseURL: API_URL,
  });

  // Función principal de búsqueda
  const performSearch = useCallback(
    async (
      searchTerm = "",
      page = 1,
      limit = 18,
      sortOrder = "createdAt_desc",
    ) => {
      if (page > 1 && searchLoading) return;

      setSearchLoading(true);
      setSearchError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortOrder,
          searchTerm: searchTerm.trim(),
        }).toString();

        const response = await api.get(`/api/products-filtered?${queryParams}`);

        if (page === 1) {
          setSearchResults(response.data.products);
          setLastSearchTerm(searchTerm);
        } else {
          setSearchResults((prevProducts) => [
            ...prevProducts,
            ...response.data.products,
          ]);
        }

        setCurrentPage(response.data.page);
        setTotalPages(response.data.pages);
        setTotalProducts(response.data.totalProducts);

        return response.data;
      } catch (err) {
        console.error(
          "SearchContext: Error al buscar productos:",
          err.response?.data || err,
        );
        const errorMessage =
          err.response?.data?.message || "Error al buscar productos.";
        setSearchError({ message: errorMessage });
        toast.error(errorMessage);
        throw err;
      } finally {
        setSearchLoading(false);
      }
    },
    [searchLoading],
  );

  // Función para cargar más resultados (infinite scroll)
  const loadMoreResults = useCallback(() => {
    if (currentPage < totalPages && !searchLoading && lastSearchTerm) {
      performSearch(lastSearchTerm, currentPage + 1);
    }
  }, [currentPage, totalPages, searchLoading, lastSearchTerm, performSearch]);

  // Función para búsqueda rápida (sugerencias/autocomplete)
  const quickSearch = useCallback(async (searchTerm) => {
    if (searchTerm.length < 2) {
      return [];
    }

    try {
      const queryParams = new URLSearchParams({
        searchTerm: searchTerm.trim(),
        limit: "5",
      }).toString();

      const response = await api.get(`/api/products-filtered?${queryParams}`);
      return response.data.products;
    } catch (err) {
      console.error("SearchContext: Error en búsqueda rápida:", err);
      return [];
    }
  }, []);

  // Limpiar resultados de búsqueda
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalProducts(0);
    setLastSearchTerm("");
    setSearchError(null);
  }, []);

  const value = {
    // Estado
    searchResults,
    searchLoading,
    searchError,
    currentPage,
    totalPages,
    totalProducts,
    lastSearchTerm,

    // Funciones
    performSearch,
    loadMoreResults,
    quickSearch,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
