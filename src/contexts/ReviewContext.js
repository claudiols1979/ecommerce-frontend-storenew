import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "./AuthContext";
import API_URL from "../config";

const ReviewContext = createContext();

export const useReviews = () => useContext(ReviewContext);

export const ReviewProvider = ({ children }) => {
  const { api, user } = useAuth(); // Usamos la instancia 'api' para acciones autenticadas
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @desc    Obtiene todas las reseñas para un producto específico.
   * Esta es una llamada PÚBLICA, por lo que usa axios directamente.
   * @param {string} productId - El ID del producto del que se quieren obtener las reseñas.
   */
  const fetchReviews = useCallback(async (productId) => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/reviews/${productId}`);
      setReviews(data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al cargar las reseñas.";
      setError({ message: errorMessage });
      // No mostramos un toast aquí para no molestar al usuario que solo está viendo.
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * @desc    Crea una nueva reseña para un producto.
   * Esta es una llamada PRIVADA, por lo que usa la instancia 'api' con token.
   * @param {object} reviewData - Objeto con { productId, rating, comment }.
   */
  const createReview = useCallback(
    async (reviewData) => {
      if (!user) {
        throw new Error("Usuario no autenticado.");
      }
      setLoading(true);
      setError(null);
      try {
        await api.post("/api/reviews", reviewData);
        // Después de crear la reseña, volvemos a cargar la lista para ese producto.
        await fetchReviews(reviewData.productId);
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "No se pudo enviar tu reseña.";
        setError({ message: errorMessage });
        throw new Error(errorMessage); // Propaga el error para que el componente lo maneje
      } finally {
        setLoading(false);
      }
    },
    [api, user, fetchReviews],
  );

  const value = useMemo(
    () => ({
      reviews,
      loading,
      error,
      fetchReviews,
      createReview,
    }),
    [reviews, loading, error, fetchReviews, createReview],
  );

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
};

ReviewProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
