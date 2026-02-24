import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import axios from 'axios';
import API_URL from '../config';

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

  const fetchProducts = useCallback(async (
    page = 1,
    limit = 18,
    sortOrder = 'createdAt_desc',
    searchTerm = '',
    selectedGender = '',
    minPrice = 0,
    maxPrice = 300000
  ) => {
    // Si es una nueva búsqueda, se indica que se está cargando.
    // Si es para cargar más (page > 1) y ya está cargando, se detiene.
    if (page > 1 && loading) return;

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortOrder,
        searchTerm,
        selectedGender,
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        _t: new Date().getTime().toString(),
      }).toString();

      // Usamos la instancia 'api' que ya tiene la lógica de autenticación
      const response = await api.get(`/api/products-filtered?${queryParams}`);

      if (page === 1) {
        // Si es la primera página (o una nueva búsqueda), reemplaza la lista.
        setProducts(response.data.products);
      } else {
        // Si es una página subsiguiente, añade los nuevos productos a la lista existente.
        setProducts(prevProducts => [...prevProducts, ...response.data.products]);
      }

      setCurrentPage(response.data.page);
      setTotalPages(response.data.pages);
      setTotalProducts(response.data.totalProducts);

    } catch (err) {
      console.error('ProductContext: Error al obtener productos filtrados:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || 'Error al cargar los productos filtrados.';
      setError({ message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api]); // --- CORRECCIÓN CLAVE: La dependencia es solo 'api', que es estable.

  const value = {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    fetchProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.node.isRequired,
};