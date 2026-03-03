import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const AdGrid3Context = createContext();

export const useAdGrid3 = () => {
    const context = useContext(AdGrid3Context);
    if (!context) {
        throw new Error("useAdGrid3 debe ser usado dentro de un AdGrid3Provider");
    }
    return context;
};

export const AdGrid3Provider = ({ children }) => {
    const { api } = useAuth();
    const [gridItems, setGridItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Items por defecto (3 items)
    const defaultItems = [
        {
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop",
            buttonText: "Ver Todo",
            buttonLink: "/products",
            title: "Anuncio Principal",
            alt: "Anuncio promocional principal",
        },
        {
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop",
            buttonText: "Comprar",
            buttonLink: "/products",
            title: "Anuncio Secundario 1",
            alt: "Anuncio promocional secundario 1",
        },
        {
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop",
            buttonText: "Descubrir",
            buttonLink: "/products",
            title: "Anuncio Secundario 2",
            alt: "Anuncio promocional secundario 2",
        },
    ];

    const fetchGridItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/ad-grid-3/public");

            if (response.data && response.data.length > 0) {
                const activeItems = response.data.filter((item) => item.isActive);

                // Initialize strictly with default items
                const newGridItems = Array.from({ length: 3 }, (_, i) => defaultItems[i]);

                // Override specific positions based on 'order'
                activeItems.forEach(item => {
                    const orderIndex = Number(item.order);
                    if (!isNaN(orderIndex) && orderIndex >= 0 && orderIndex < 3) {
                        newGridItems[orderIndex] = item;
                    }
                });

                setGridItems(newGridItems);
            } else {
                setGridItems([...defaultItems]);
            }
        } catch (err) {
            console.error("Error al obtener los items del grid 3:", err);
            setGridItems(defaultItems);
            setError("Error al cargar el grid promocional 3.");
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

    const processCloudinaryUrl = (url, isLarge) => {
        if (url && url.includes("cloudinary.com")) {
            const baseUrl = url.split("?")[0];
            if (isLarge) {
                return `${baseUrl}?w=800&h=800&c=fill&f=auto`;
            } else {
                return `${baseUrl}?w=400&h=400&c=fill&f=auto`;
            }
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
        <AdGrid3Context.Provider value={value}>{children}</AdGrid3Context.Provider>
    );
};
