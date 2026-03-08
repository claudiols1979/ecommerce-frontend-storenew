import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const AdGrid4Context = createContext();

export const useAdGrid4 = () => {
    const context = useContext(AdGrid4Context);
    if (!context) {
        throw new Error("useAdGrid4 debe ser usado dentro de un AdGrid4Provider");
    }
    return context;
};

export const AdGrid4Provider = ({ children }) => {
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
            title: "Promoción 4 - 1",
            alt: "Promoción 4 - 1",
        },
        {
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop",
            buttonText: "Comprar",
            buttonLink: "/products",
            title: "Promoción 4 - 2",
            alt: "Promoción 4 - 2",
        },
        {
            image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop",
            buttonText: "Descubrir",
            buttonLink: "/products",
            title: "Promoción 4 - 3",
            alt: "Promoción 4 - 3",
        },
    ];

    const fetchGridItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/ad-grid-4/public");

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
            console.error("Error al obtener los items del grid 4:", err);
            setGridItems(defaultItems);
            setError("Error al cargar el grid promocional 4.");
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
            // Detect if it's a video based on /video/ path or common video extensions
            const isVideo = url.includes("/video/upload/") || url.match(/\.(mp4|webm|ogg|mov|avi|flv|wmv|mpg|mpeg)$/i);

            if (isVideo) {
                // Return original URL or basic video optimization for videos
                return url.includes("?") ? url : `${url}?f_auto=true`;
            }

            const baseUrl = url.split("?")[0];
            if (isLarge) {
                // Remove fixed height and increase resolution to 1920w to avoid blurriness and reduce zoom feel
                return `${baseUrl}?w=1920&c=limit&f=auto&q=auto:best`;
            } else {
                return `${baseUrl}?w=1000&c=limit&f=auto&q=auto:best`;
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
        <AdGrid4Context.Provider value={value}>{children}</AdGrid4Context.Provider>
    );
};
