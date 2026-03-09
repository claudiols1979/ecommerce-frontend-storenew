import React, { useState, useRef, useEffect } from "react";
import { Fab, Badge, Zoom, useTheme, useMediaQuery } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate, useLocation } from "react-router-dom";
import { useOrders } from "../../contexts/OrderContext";

const FloatingCart = () => {
    const { cartItems } = useOrders();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const cartItemCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    // Position state
    const [position, setPosition] = useState({
        x: (typeof window !== 'undefined' ? window.innerWidth : 400) - (isMobile ? 76 : 94),
        y: isMobile ? 210 : 170
    });
    const [isDragging, setIsDragging] = useState(false);
    const dragInfo = useRef({
        isDown: false,
        startX: 0,
        startY: 0,
        startPosX: 0,
        startPosY: 0,
        moved: false
    });

    // Update position if screen resizes
    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 64),
                y: Math.min(prev.y, window.innerHeight - 64)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleStart = (clientX, clientY) => {
        dragInfo.current = {
            isDown: true,
            startX: clientX,
            startY: clientY,
            startPosX: position.x,
            startPosY: position.y,
            moved: false
        };
    };

    const handleMove = (clientX, clientY) => {
        if (!dragInfo.current.isDown) return;

        const deltaX = clientX - dragInfo.current.startX;
        const deltaY = clientY - dragInfo.current.startY;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            dragInfo.current.moved = true;
            setIsDragging(true);
        }

        if (dragInfo.current.moved) {
            // Constrain within viewport
            const newX = Math.max(0, Math.min(window.innerWidth - (isMobile ? 56 : 64), dragInfo.current.startPosX + deltaX));
            const newY = Math.max(0, Math.min(window.innerHeight - (isMobile ? 56 : 64), dragInfo.current.startPosY + deltaY));

            setPosition({ x: newX, y: newY });
        }
    };

    const handleEnd = () => {
        if (!dragInfo.current.moved && dragInfo.current.isDown) {
            navigate("/cart");
        }
        dragInfo.current.isDown = false;
        setIsDragging(false);
    };

    // MOBILE ONLY and hide on cart or checkout pages
    if (!isMobile || location.pathname === "/cart" || location.pathname === "/checkout") {
        return null;
    }

    return (
        <Fab
            aria-label="cart"
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleEnd}
            sx={{
                position: "fixed",
                left: position.x,
                top: position.y,
                zIndex: (theme) => theme.zIndex.drawer + 9999, // Super high to be over everything
                background: "linear-gradient(135deg, rgba(49, 0, 138, 0.95) 0%, rgba(49, 0, 138, 1) 35%, rgba(168, 85, 247, 1) 65%, rgba(247, 37, 133, 1) 100%)",
                color: "white",
                width: isMobile ? 56 : 64,
                height: isMobile ? 56 : 64,
                boxShadow: isDragging ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.3)",
                cursor: isDragging ? "grabbing" : "grab",
                touchAction: "none", // Prevent scrolling while dragging
                "&:hover": {
                    transform: isDragging ? "none" : "scale(1.1)",
                    background: "linear-gradient(135deg, rgba(49, 0, 138, 1) 0%, rgba(168, 85, 247, 1) 50%, rgba(247, 37, 133, 1) 100%)",
                },
                transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
        >
            <Badge
                badgeContent={cartItemCount}
                color="success"
                sx={{
                    "& .MuiBadge-badge": {
                        fontSize: "0.85rem",
                        height: 22,
                        minWidth: 22,
                        borderRadius: 11,
                        border: "2px solid white",
                        fontWeight: "bold"
                    }
                }}
            >
                <ShoppingCartIcon sx={{ fontSize: isMobile ? 28 : 32 }} />
            </Badge>
        </Fab>
    );
};

export default FloatingCart;
