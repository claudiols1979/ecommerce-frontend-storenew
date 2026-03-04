import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user, api, isAuthenticated } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (isAuthenticated && user?.token) {
            setLoading(true);
            try {
                const response = await api.get('/api/wishlist');
                setWishlist(response.data);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            } finally {
                setLoading(false);
            }
        } else {
            const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
            setWishlist(localWishlist);
        }
    }, [isAuthenticated, user, api]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (product) => {
        const isCurrentlyInWishlist = wishlist.some(item => {
            const itemId = typeof item === 'object' && item !== null && item._id ? item._id : item;
            return String(itemId) === String(product._id);
        });

        if (isAuthenticated && user?.token) {
            try {
                const response = await api.post('/api/wishlist/toggle', { productId: product._id });
                setWishlist(response.data.wishlist);
                return response.data.isAdded;
            } catch (error) {
                console.error('Error toggling wishlist:', error);
                return false;
            }
        } else {
            let newWishlist;
            let isAdded = false;
            if (isCurrentlyInWishlist) {
                newWishlist = wishlist.filter(item => item._id !== product._id);
            } else {
                newWishlist = [...wishlist, product];
                isAdded = true;
            }
            setWishlist(newWishlist);
            localStorage.setItem('localWishlist', JSON.stringify(newWishlist));
            return isAdded;
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => {
            const itemId = typeof item === 'object' && item !== null && item._id ? item._id : item;
            return String(itemId) === String(productId);
        });
    };

    const value = {
        wishlist,
        loading,
        toggleWishlist,
        isInWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
