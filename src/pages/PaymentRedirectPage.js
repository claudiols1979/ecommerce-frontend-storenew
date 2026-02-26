import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Button, Card, CardContent,
    CircularProgress, Paper, useTheme, List, ListItem, ListItemText, Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useOrders } from '../contexts/OrderContext';
import { formatPrice } from '../utils/formatters';
import axios from 'axios';
import API_URL from '../config';

const PaymentRedirectPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchCart, clearCart } = useOrders();
    const theme = useTheme();

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Procesando su pago...');
    const [orderInfo, setOrderInfo] = useState(null);

    const mainGradient = "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(49, 0, 138, 0.85) 35%, rgba(168, 85, 247, 0.85) 65%, rgba(247, 37, 133, 0.85) 100%)";

    const glassStyle = {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        borderRadius: "32px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
    };

    const gradientButtonStyle = {
        background: 'linear-gradient(90deg, #A855F7 0%, #F72585 100%)',
        color: 'white',
        fontWeight: 800,
        textTransform: 'none',
        borderRadius: '16px',
        py: 1.5,
        px: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(168, 85, 247, 0.4)',
            filter: 'brightness(1.1)'
        }
    };

    const fadeInUp = {
        "@keyframes fadeInUp": {
            from: { opacity: 0, transform: "translateY(40px)" },
            to: { opacity: 1, transform: "translateY(0)" }
        },
        animation: "fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards"
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const description = queryParams.get('description');
        const orderNumber = queryParams.get('order');

        if (!code || !orderNumber) {
            setStatus('error');
            setMessage('Parámetros de pago inválidos. Contacte a soporte.');
            return;
        }

        const handleFinalizePayment = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/orders/cart/payment-redirect-handler${location.search}`);
                const data = response.data;

                if (data.success) {
                    setStatus('success');
                    setMessage('¡Su pedido ha sido procesado con éxito!');
                    setOrderInfo(data.order);
                    clearCart();
                    fetchCart();
                } else {
                    setStatus('error');
                    setMessage(`El pago falló: ${data.message || 'Error desconocido'}`);
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Hubo un problema de conexión. Por favor, revise el estado de su pedido en su perfil.');
                console.error('Error al finalizar el pago en el frontend:', err);
            }
        };

        if (code === '1') {
            handleFinalizePayment();
        } else {
            setStatus('error');
            setMessage(`La transacción fue rechazada. Motivo: ${description || 'Desconocido'}. Por favor, intente de nuevo.`);
        }
    }, [location.search, clearCart, fetchCart]);

    const renderContent = () => {
        if (status === 'loading') {
            return (
                <Box sx={{ textAlign: 'center', py: 10, ...fadeInUp }}>
                    <CircularProgress size={60} sx={{ color: '#A855F7', mb: 4 }} />
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>{message}</Typography>
                </Box>
            );
        }

        if (status === 'success') {
            return (
                <Box sx={fadeInUp}>
                    <Card sx={glassStyle}>
                        <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 100, color: '#4ade80', filter: 'drop-shadow(0 0 15px rgba(74, 222, 128, 0.4))' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 2, letterSpacing: '-0.02em' }}>
                                ¡Pedido Exitoso!
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 600, mx: 'auto' }}>
                                Su pedido ha sido procesado y el pago ha sido aprobado. ¡Gracias por confiar en nosotros!
                            </Typography>

                            {orderInfo && (
                                <Box sx={{
                                    p: 3, background: "rgba(255,255,255,0.03)", borderRadius: "24px", mb: 4,
                                    border: "1px solid rgba(255,255,255,0.1)"
                                }}>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>ID de Pedido</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>{orderInfo._id}</Typography>
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#4ade80' }}>{formatPrice(orderInfo.totalPrice)}</Typography>
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/profile')}
                                    sx={gradientButtonStyle}
                                >
                                    Ver Mis Pedidos
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/')}
                                    sx={{
                                        borderRadius: '16px', py: 1.5, px: 4, fontWeight: 700, color: 'white',
                                        borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    Seguir Comprando
                                </Button>
                            </Box>

                            {orderInfo && orderInfo.items.length > 0 && (
                                <Box sx={{ mt: 6, pt: 6, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 4 }}>
                                        ¿Qué tal tu experiencia?
                                    </Typography>
                                    <List sx={{ maxWidth: 600, mx: 'auto' }}>
                                        {orderInfo.items.map(item => (
                                            <ListItem
                                                key={item.product}
                                                sx={{
                                                    background: 'rgba(255,255,255,0.03)', borderRadius: '20px', mb: 2, p: 2,
                                                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between'
                                                }}
                                            >
                                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>{item.name}</Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={<RateReviewIcon />}
                                                    onClick={() => navigate(`/products/${item.product}`)}
                                                    sx={{
                                                        color: '#F72585', fontWeight: 700, textTransform: 'none',
                                                        '&:hover': { background: 'rgba(247, 37, 133, 0.1)' }
                                                    }}
                                                >
                                                    Opinar
                                                </Button>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            );
        }

        if (status === 'error') {
            return (
                <Box sx={fadeInUp}>
                    <Card sx={glassStyle}>
                        <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
                            <Box sx={{ mb: 3 }}>
                                <ErrorOutlineIcon sx={{ fontSize: 100, color: '#f87171', filter: 'drop-shadow(0 0 15px rgba(248, 113, 113, 0.4))' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 2 }}>
                                ¡Pago No Procesado!
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 600, mx: 'auto' }}>
                                {message}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/checkout')}
                                sx={gradientButtonStyle}
                            >
                                Reintentar Pago
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            );
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', width: '100%', background: mainGradient,
            py: 8, px: 2, position: 'relative', overflow: 'hidden'
        }}>
            {/* Decorative Orbs */}
            <Box sx={{
                position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0
            }} />
            <Box sx={{
                position: 'absolute', bottom: '-10%', left: '-5%', width: '40vw', height: '40vw',
                background: 'radial-gradient(circle, rgba(247, 37, 133, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0
            }} />

            <Container maxWidth="lg">
                {renderContent()}
            </Container>
        </Box>
    );
};

export default PaymentRedirectPage;