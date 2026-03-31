import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

// Crear el contexto
const AdGridContext = createContext();

// Hook personalizado para usar el contexto
export const useAdGrid = () => {
  const context = useContext(AdGridContext);
  if (!context) {
    throw new Error("useAdGrid debe ser usado dentro de un AdGridProvider");
  }
  return context;
};

// Proveedor del contexto
export const AdGridProvider = ({ children }) => {
  const { api, isAuthenticated } = useAuth();
  const [gridItems, setGridItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dryzziijr";

  // Items por defecto (Solo 1 para nuevas instalaciones)
  const defaultItems = [
    {
      image:
        `https://res.cloudinary.com/${cloudName}/image/upload/v1754589040/syed-muhammad-baqir-zaidi-3qNVEa7SN_8-unsplash_jrfvpr.jpg`,
      department: "Fragancias",
      title: "Fragancias",
      alt: "Fragancias para hombre y mujer",
    }
  ];

  // Fetch grid items from backend - RUTA PÚBLICA
  const fetchGridItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Para rutas públicas, usar axios directamente sin auth
      const response = await api.get("/api/ad-grid/public");

      // Si hay items en la base de datos, usarlos; si no, usar los por defecto
      if (response.data && response.data.length > 0) {
        // Ordenar por el campo 'order' y tomar solo los activos
        const activeItems = response.data
          .filter((item) => item.isActive)
          .sort((a, b) => a.order - b.order);

        // Si hay items activos, los usamos todos. Si no hay ninguno activo, usamos el default.
        if (activeItems.length > 0) {
          setGridItems(activeItems);
        } else {
          setGridItems(defaultItems);
        }
      } else {
        // Si no hay datos en la BD, usar el default (1 solo item)
        setGridItems(defaultItems);
      }
    } catch (err) {
      console.error("Error al obtener los items del grid:", err);
      // En caso de error, mostrar items por defecto
      setGridItems(defaultItems);
      setError(
        "Error al cargar el grid de departamentos. Mostrando items por defecto.",
      );
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Fetch grid items cuando el componente se monta
  useEffect(() => {
    fetchGridItems();
  }, [fetchGridItems]);

  // Función para recargar los items
  const refetchGridItems = useCallback(() => {
    fetchGridItems();
  }, [fetchGridItems]);

  // Función para procesar URLs de Cloudinary
  const processCloudinaryUrl = (url) => {
    if (url && url.includes("cloudinary.com")) {
      // Añadir parámetros de transformación para forzar tamaño y recorte consistentes
      const baseUrl = url.split("?")[0]; // Eliminar parámetros existentes si los hay
      return `${baseUrl}?w=600&h=600&c=fill&f=auto`;
    }
    return url;
  };

  const value = {
    // Estado
    gridItems,
    loading,
    error,

    // Funciones públicas (para ecommerce frontend)
    refetchGridItems,

    // Items por defecto
    defaultItems,

    // Utilidades
    processCloudinaryUrl,
  };

  return (
    <AdGridContext.Provider value={value}>{children}</AdGridContext.Provider>
  );
};
