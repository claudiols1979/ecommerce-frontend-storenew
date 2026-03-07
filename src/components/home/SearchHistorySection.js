import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import axios from 'axios';
import ProductMarqueeSection from "./ProductMarqueeSection";
import { useOrders } from "../../contexts/OrderContext";
import { useAuth } from "../../contexts/AuthContext";

const SearchHistorySection = () => {
    const [recentProducts, setRecentProducts] = useState([]);
    const { addItemToCart } = useOrders();
    const { user, api } = useAuth();
    const [addingProductId, setAddingProductId] = useState(null);

    // Load from localStorage event
    const loadRecentProducts = useCallback(async () => {
        try {
            const stored = localStorage.getItem("recentProducts");
            if (stored) {
                let recentItems = JSON.parse(stored);

                // Extra filter to remove items that share a baseCode (so we only show 1 variant of each product in history)
                const getBaseCode = (code) => {
                    if (!code) return "";
                    const idx = code.indexOf("_");
                    return idx === -1 ? code : code.substring(0, idx);
                };

                const uniqueItems = [];
                const seenBaseCodes = new Set();

                for (const item of recentItems) {
                    const baseCode = getBaseCode(item.code) || item._id;
                    if (!seenBaseCodes.has(baseCode)) {
                        seenBaseCodes.add(baseCode);
                        uniqueItems.push(item);
                    }
                }

                const ids = uniqueItems.map(item => item._id);

                if (ids.length > 0 && api) {
                    const response = await api.post('/api/products/public/batch', { ids });
                    if (response.data) {
                        setRecentProducts(response.data);
                    }
                } else if (ids.length > 0) {
                    // Fallback in case auth context api is not available (like guest) but backend allows optional protect
                    const fallbackUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
                    axios.post(`${fallbackUrl}/api/products/public/batch`, { ids })
                        .then(res => setRecentProducts(res.data))
                        .catch(err => console.error("Guest fetch error", err));
                }
            }
        } catch (e) {
            console.error("Error loading recent products from local storage", e);
        }
    }, [user]);

    useEffect(() => {
        loadRecentProducts();

        // Custom event listener to update whenever a product is added to history
        const handleUpdate = () => {
            loadRecentProducts();
        };

        window.addEventListener("recentProductsUpdated", handleUpdate);

        return () => {
            window.removeEventListener("recentProductsUpdated", handleUpdate);
        };
    }, [loadRecentProducts]);

    const handleAddToCart = useCallback(
        async (product) => {
            if (typeof addItemToCart !== "function") return;

            setAddingProductId(product._id);

            const getPriceForCart = () => {
                let calculatedPrice = null;
                if (user && user.role === "Revendedor" && user.resellerCategory && product.resellerPrices) {
                    const priceForCategory = product.resellerPrices[user.resellerCategory];
                    if (typeof priceForCategory === "number" && priceForCategory > 0) {
                        calculatedPrice = priceForCategory;
                    }
                }
                if (calculatedPrice === null && product.resellerPrices && typeof product.resellerPrices.cat1 === "number" && product.resellerPrices.cat1 > 0) {
                    calculatedPrice = product.resellerPrices.cat1;
                }
                return calculatedPrice || 0;
            };

            const priceToPass = getPriceForCart();
            if (priceToPass <= 0) {
                setAddingProductId(null);
                return;
            }

            try {
                await addItemToCart(product._id, 1, priceToPass);
            } catch (err) {
                console.error(err);
            } finally {
                setAddingProductId(null);
            }
        },
        [addItemToCart, user]
    );

    if (!recentProducts || recentProducts.length === 0) {
        return null;
    }

    return (
        <Box sx={{ py: 5, width: '100%', overflow: 'hidden' }}>
            <ProductMarqueeSection
                title="Tu Historial de Búsqueda"
                products={recentProducts}
                onAddToCart={handleAddToCart}
                addingProductId={addingProductId}
            />
        </Box>
    );
};

export default SearchHistorySection;
