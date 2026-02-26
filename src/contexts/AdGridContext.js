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

  // Items por defecto
  const defaultItems = [
    {
      image:
        "https://res.cloudinary.com/dl4k0gqfv/image/upload/v1754589040/syed-muhammad-baqir-zaidi-3qNVEa7SN_8-unsplash_jrfvpr.jpg",
      department: "Fragancias",
      title: "Fragancias",
      alt: "Fragancias para hombre y mujer",
    },
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
      department: "Ropa",
      title: "Ropa",
      alt: "Ropa para toda la familia",
    },
    {
      image:
        "https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758213291/cut-collective-u94ywFnPedw-unsplash_z02shc.jpg",
      department: "Calzado",
      title: "Calzado",
      alt: "Calzado de última moda",
    },
    {
      image:
        "https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758178128/christopher-gower-_aXa21cf7rY-unsplash_wao9x2.jpg",
      department: "Electrónicos",
      title: "Electrónicos",
      alt: "Tecnología y electrónicos",
    },
    {
      image:
        "https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758478320/air_conditioner_zers0j.jpg",
      department: "Aires Acondicionados",
      title: "Aires Acondicionados",
      alt: "Aires acondicionados y climatización",
    },
    {
      image:
        "https://res.cloudinary.com/dl4k0gqfv/image/upload/v1758217151/catia-dombaxe-8IlqMcDYKA8-unsplash_jimlbl.jpg",
      department: "Accesorios",
      title: "Accesorios",
      alt: "Accesorios y complementos",
    },
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

        // Si hay menos de 6 items activos, completar con defaults
        if (activeItems.length < 6) {
          const neededItems = 6 - activeItems.length;
          const additionalItems = defaultItems.slice(0, neededItems);
          setGridItems([...activeItems, ...additionalItems]);
        } else {
          setGridItems(activeItems);
        }
      } else {
        // Si no hay datos en la BD, usar todos los defaults
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
