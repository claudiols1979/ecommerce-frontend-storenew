import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ProductMarqueeSection = ({ title, products, onAddToCart, addingProductId, linkTo, reverse = false }) => {
    const navigate = useNavigate();

    if (!products || products.length === 0) return null;

    // Solo animar y duplicar si hay más de 4 productos, para no verse muy corto o duplicado en pantallas grandes
    const shouldAnimate = products.length >= 4;

    return (
        <Box sx={{ mt: 8, mb: 4, width: '100%', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, px: { xs: 2, md: 4 } }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        color: 'text.primary', // Black/dark depending on theme
                        textAlign: 'left'
                    }}
                >
                    {title}
                </Typography>

                {linkTo && (
                    <Button
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(linkTo)}
                        sx={{
                            fontWeight: 600,
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'primary.main',
                                background: 'transparent'
                            }
                        }}
                    >
                        Ver todo
                    </Button>
                )}
            </Box>

            {/* Marquee Container */}
            <Box
                sx={{
                    display: 'flex',
                    overflow: 'hidden',
                    width: '100%',
                    position: 'relative',
                    paddingBottom: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        paddingX: 2,
                        width: shouldAnimate ? 'max-content' : 'auto',
                        animation: shouldAnimate ? `marquee 30s linear infinite${reverse ? ' reverse' : ''}` : 'none',
                        '&:hover': {
                            animationPlayState: 'paused', // Pause on hover for better UX
                        },
                        '@keyframes marquee': {
                            '0%': { transform: 'translateX(0)' },
                            // Moving left by exactly 50% since we duplicate the content
                            '100%': { transform: 'translateX(-50%)' },
                        },
                        // We use standard media queries to slow it down on mobile since cards take more screen width
                        '@media (max-width: 600px)': {
                            animationDuration: '20s',
                        }
                    }}
                >
                    {/* First set of products */}
                    {products.map((product, index) => (
                        <Box key={`m1-${product._id}-${index}`} sx={{ flexShrink: 0 }}>
                            <ProductCard
                                product={{
                                    ...product,
                                    name: product.baseName || product.name,
                                    variantCount: product.variantCount,
                                }}
                                onAddToCart={() => onAddToCart(product)}
                                isAdding={addingProductId === product._id}
                            />
                        </Box>
                    ))}

                    {/* Second set of products exactly identical for seamless infinite loop (ONLY if animating) */}
                    {shouldAnimate && products.map((product, index) => (
                        <Box key={`m2-${product._id}-${index}`} sx={{ flexShrink: 0 }}>
                            <ProductCard
                                product={{
                                    ...product,
                                    name: product.baseName || product.name,
                                    variantCount: product.variantCount,
                                }}
                                onAddToCart={() => onAddToCart(product)}
                                isAdding={addingProductId === product._id}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default ProductMarqueeSection;
