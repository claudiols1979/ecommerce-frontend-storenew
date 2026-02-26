import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

// Crear el contexto
const HeroCarouselContext = createContext();

// Hook personalizado para usar el contexto
export const useHeroCarousel = () => {
  const context = useContext(HeroCarouselContext);
  if (!context) {
    throw new Error(
      "useHeroCarousel debe ser usado dentro de un HeroCarouselProvider",
    );
  }
  return context;
};

// Proveedor del contexto
export const HeroCarouselProvider = ({ children }) => {
  const { api, isAuthenticated } = useAuth();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Slides por defecto
  const defaultSlides = [
    {
      image:
        "https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758209893/erik-mclean-nfoRa6NHTbU-unsplash_cthnfk.jpg",
      alt: "Nuevas Colecciónes",
      title: "Descubre las nuevas colecciones",
      description:
        "Estilo para cada gusto. ¡Explora nuestros últimos productos!",
      buttonText: "Ver Productos",
      buttonLink: "/products",
    },
    {
      image:
        "https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758218247/cardmapr-nl-pwxESDWRwDE-unsplash_lny8bk.jpg",
      alt: "Ofertas Exclusivas",
      title: "Ofertas Exclusivas",
      description: "Precios especiales que no querrás perder!",
      buttonText: "Ver Productos",
      buttonLink: "/products",
    },
    {
      image:
        "https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758213151/charlesdeluvio-FK81rxilUXg-unsplash_xrs3ih.jpg",
      alt: "Calidad Garantizada",
      title: "Productos 100% originales",
      description: "Comprometidos con la excelencia en cada artículo.",
      buttonText: "Ver Productos",
      buttonLink: "/products",
    },
  ];

  // Fetch slides from backend - RUTA PÚBLICA
  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Para rutas públicas, usar axios directamente sin auth
      const response = await api.get("/api/hero-carousel/public");

      // Si hay slides en la base de datos, usarlos; si no, usar los por defecto
      if (response.data && response.data.length > 0) {
        setSlides(response.data);
      } else {
        setSlides(defaultSlides);
      }
    } catch (err) {
      console.error("Error al obtener los slides:", err);
      // En caso de error, mostrar slides por defecto
      setSlides(defaultSlides);
      setError("Error al cargar el carrusel. Mostrando slides por defecto.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Fetch slides cuando el componente se monta
  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Función para recargar los slides
  const refetchSlides = useCallback(() => {
    fetchSlides();
  }, [fetchSlides]);

  const value = {
    // Estado
    slides,
    loading,
    error,

    // Funciones públicas (para ecommerce frontend)
    refetchSlides,

    // Slides por defecto
    defaultSlides,
  };

  return (
    <HeroCarouselContext.Provider value={value}>
      {children}
    </HeroCarouselContext.Provider>
  );
};
