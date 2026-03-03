import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const AdGrid2Context = createContext();

export const useAdGrid2 = () => {
    const context = useContext(AdGrid2Context);
    if (!context) {
        throw new Error("useAdGrid2 debe ser usado dentro de un AdGrid2Provider");
    }
    return context;
};

export const AdGrid2Provider = ({ children }) => {
    const { api } = useAuth();
    const [gridItems, setGridItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Items por defecto (2 items)
    const defaultItems = [
        {
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop",
            buttonText: "Ver Promoción",
            buttonLink: "/products",
            title: "Anuncio 1",
            alt: "Anuncio promocional 1",
        },
        {
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=400&fit=crop",
            buttonText: "Comprar Ahora",
            buttonLink: "/products",
            title: "Anuncio 2",
            alt: "Anuncio promocional 2",
        },
    ];

    const fetchGridItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/ad-grid-2/public");

            if (response.data && response.data.length > 0) {
                const activeItems = response.data.filter((item) => item.isActive);

                // Initialize strictly with default items
                const newGridItems = Array.from({ length: 2 }, (_, i) => defaultItems[i]);

                // Override specific positions based on 'order'
                activeItems.forEach(item => {
                    const orderIndex = Number(item.order);
                    if (!isNaN(orderIndex) && orderIndex >= 0 && orderIndex < 2) {
                        newGridItems[orderIndex] = item;
                    }
                });

                setGridItems(newGridItems);
            } else {
                setGridItems([...defaultItems]);
            }
        } catch (err) {
            console.error("Error al obtener los items del grid 2:", err);
            setGridItems(defaultItems);
            setError("Error al cargar el grid promocional 2.");
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchGridItems();
    }, [fetchGridItems]);

    const refetchGridItems = useCallback(() => {
        fetchGridItems();
    }, [fetchGridItems]);

    const processCloudinaryUrl = (url) => {
        if (url && url.includes("cloudinary.com")) {
            const baseUrl = url.split("?")[0];
            return `${baseUrl}?w=800&h=400&c=fill&f=auto`; // Diferente proporción para Grid 2 (horizontal)
        }
        return url;
    };

    const value = {
        gridItems,
        loading,
        error,
        refetchGridItems,
        defaultItems,
        processCloudinaryUrl,
    };

    return (
        <AdGrid2Context.Provider value={value}>{children}</AdGrid2Context.Provider>
    );
};
