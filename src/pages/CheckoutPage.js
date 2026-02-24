import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Button, Grid, TextField,
    CircularProgress, Divider, List, ListItem, Paper, FormControl,
    Select, MenuItem, useTheme, InputLabel, alpha
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { useUpdateInfo } from '../contexts/UpdateInfoContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatPrice } from '../utils/formatters';
import { calculatePriceWithTax } from '../utils/taxCalculations';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CRAddressSelector from '../components/CRAddressSelector';

const CheckoutPage = () => {
    const { cartItems, loading, initiateTilopayPayment } = useOrders();
    const { user } = useAuth();
    const { taxRegime } = useConfig();
    const { updateResellerProfile } = useUpdateInfo();
    const navigate = useNavigate();
    const theme = useTheme();

    const [shippingDetails, setShippingDetails] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
    });

    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCanton, setSelectedCanton] = useState('');
    const [selectedDistrito, setSelectedDistrito] = useState('');
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingMessage, setShippingMessage] = useState('');
    const [provinceTouched, setProvinceTouched] = useState(false);
    const [paymentButtonLoading, setPaymentButtonLoading] = useState(false);

    const [touchedFields, setTouchedFields] = useState({
        name: false,
        email: false,
        phone: false,
        address: false,
        city: false,
        province: false
    });

    // Función para manejar cuando un campo pierde el focus (se toca)
    const handleFieldBlur = (fieldName) => {
        setTouchedFields(prev => ({
            ...prev,
            [fieldName]: true
        }));
    };

    // Función para verificar si un campo debe mostrar error
    const shouldShowError = (fieldName, value) => {
        return touchedFields[fieldName] && !value;
    };

    const totalCartPrice = cartItems.reduce((acc, item) => {
        const priceWithTax = item.product ?
            (taxRegime === 'simplified' ? Math.round(item.priceAtSale) : calculatePriceWithTax(item.priceAtSale, item.product.iva)) :
            item.priceAtSale;
        return acc + (item.quantity * priceWithTax);
    }, 0);

    const finalTotalPrice = totalCartPrice + shippingCost;

    const provinces = ["Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas", "San José"];

    // List of GAM Cantons (Mirror of backend logic)
    const GAM_CANTONS = {
        "san jose": ["central", "escazu", "desamparados", "aserri", "mora", "goicoechea", "santa ana", "alajuelita", "vazquez de coronado", "tibas", "moravia", "montes de oca", "curridabat", "puriscal"],
        "alajuela": ["central", "atenas", "grecia", "naranjo", "palmares", "poas", "orotina", "sarchi", "zarcero"],
        "cartago": ["central", "paraiso", "la union", "jimenez", "alvarado", "oreamuno", "el guarco"],
        "heredia": ["central", "barva", "santo domingo", "santa barbara", "san rafael", "san isidro", "belen", "flores", "san pablo"]
    };

    const normalize = (str) =>
        str
            ? str
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
            : "";

    const isGAM = (prov, cant) => {
        if (!prov || !cant) return false;
        const nProv = normalize(prov);
        const nCant = normalize(cant);
        const gamProv = GAM_CANTONS[nProv];
        return gamProv ? gamProv.includes(nCant) : false;
    };

    const calculateShippingFee = (prov, cant, items) => {
        if (!prov || !cant) return 0;

        const totalWeight = items.reduce((sum, item) => sum + (item.quantity * (item.product?.weight || 100)), 0);
        const inGAM = isGAM(prov, cant);

        // Matriz Correos 2025
        const tariffs = [
            { maxW: 250, gam: 1850, resto: 2150 },
            { maxW: 500, gam: 1950, resto: 2500 },
            { maxW: 1000, gam: 2350, resto: 3450 }
        ];

        const rate = tariffs.find(t => totalWeight <= t.maxW);
        let base = 0;

        if (rate) {
            base = inGAM ? rate.gam : rate.resto;
        } else {
            // Dynamic formula for weight > 1000g
            const base1kg = inGAM ? 2350 : 3450;
            const extraKiloRate = 1100;
            const totalKilos = totalWeight / 1000;
            const extraKilos = Math.ceil(totalKilos - 1);
            base = base1kg + (extraKilos * extraKiloRate);
        }

        return base;
    };

    const [breakdown, setBreakdown] = useState({
        itemsSubtotal: 0,
        itemsTax: 0,
        shippingBase: 0,
        shippingTax: 0,
        total: 0
    });

    useEffect(() => {
        const iSubtotal = cartItems.reduce((acc, item) => acc + (item.quantity * item.priceAtSale), 0);
        const iTax = taxRegime === 'simplified' ? 0 : cartItems.reduce((acc, item) => {
            const iva = parseFloat(item.product?.iva) || 0;
            return acc + Math.round(item.quantity * item.priceAtSale * (iva / 100));
        }, 0);

        const currentCanton = selectedCanton || shippingDetails.city;

        const sBaseRaw = calculateShippingFee(selectedProvince, currentCanton, cartItems);
        const sTax = taxRegime === 'simplified' ? 0 : Math.round(sBaseRaw * 0.13);
        const sBase = taxRegime === 'simplified' ? Math.round(sBaseRaw * 1.13) : sBaseRaw;

        setBreakdown({
            itemsSubtotal: iSubtotal,
            itemsTax: iTax,
            shippingBase: sBase,
            shippingTax: sTax,
            total: Math.round(iSubtotal + iTax + sBase + sTax)
        });

        if (selectedProvince && shippingDetails.city) {
            setShippingCost(sBase + sTax);
            setShippingMessage(isGAM(selectedProvince, shippingDetails.city) ? 'Tarifa GAM (EMS Nacional)' : 'Tarifa Resto del País (EMS Nacional)');
        } else {
            setShippingCost(0);
            setShippingMessage('');
        }
    }, [selectedProvince, selectedCanton, shippingDetails.city, cartItems]);

    useEffect(() => {
        if (!loading && cartItems.length === 0 && !orderPlaced) {
            navigate('/products');
        }
    }, [cartItems, loading, navigate, orderPlaced]);

    useEffect(() => {
        if (user) {
            // ✅ CORREGIDO: Cargar todos los datos del usuario incluyendo provincia y ciudad
            const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '';

            setShippingDetails(prev => ({
                ...prev,
                name: fullName || prev.name,
                email: user.email || prev.email,
                phone: user.phoneNumber || prev.phone,
                address: user.address || prev.address,
                city: user.city || prev.city, // ✅ Ahora sí carga la ciudad
            }));

            // ✅ CORREGIDO: Cargar provincia, cantón y distrito del usuario si existen
            if (user.provincia || user.province) {
                setSelectedProvince(user.provincia || user.province);
                setProvinceTouched(true);
            }
            if (user.canton || user.city) {
                setSelectedCanton(user.canton || user.city);
            }
            if (user.distrito) {
                setSelectedDistrito(user.distrito);
            }
        }
    }, [user]);

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleProvinceChange = (e) => {
        setSelectedProvince(e.target.value);
        setProvinceTouched(true);
    };

    // ✅ NUEVA FUNCIÓN: Actualizar perfil del usuario con la información de envío
    const updateUserProfileWithShippingInfo = async () => {
        if (!user || !user._id) return;

        try {
            // Extraer nombre y apellido del campo name
            const nameParts = shippingDetails.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const updatedData = {
                firstName: firstName,
                lastName: lastName,
                email: shippingDetails.email,
                phoneNumber: shippingDetails.phone,
                address: shippingDetails.address,
                city: selectedCanton || shippingDetails.city,
                province: selectedProvince,
                provincia: selectedProvince,
                canton: selectedCanton || shippingDetails.city,
                distrito: selectedDistrito
            };

            await updateResellerProfile(user._id, updatedData);
            // La actualización del contexto de auth se maneja automáticamente en el contexto UpdateInfo
        } catch (error) {
            console.error('Error al actualizar perfil del usuario:', error);
            // No mostramos error al usuario para no interrumpir el flujo de checkout
        }
    };

    const handleInitiatePayment = async () => {
        if (!user) {
            toast.error("Debes iniciar sesión para finalizar el pedido.");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("No puedes procesar el pago con un carrito vacío.");
            return;
        }

        if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.email || !shippingDetails.city || !selectedProvince) {
            toast.error("Por favor, completa toda la información de envío, incluyendo la provincia y la ciudad.");
            return;
        }

        setPaymentButtonLoading(true);

        try {
            // ✅ NUEVO: Actualizar perfil del usuario antes de proceder al pago
            await updateUserProfileWithShippingInfo();

            const finalShippingDetails = {
                ...shippingDetails,
                province: selectedProvince,
                provincia: selectedProvince,
                canton: selectedCanton || shippingDetails.city,
                distrito: selectedDistrito,
                city: selectedCanton || shippingDetails.city,
            };

            const paymentUrl = await initiateTilopayPayment(finalShippingDetails);

            if (paymentUrl) {
                window.location.href = paymentUrl;
            }
        } catch (err) {
            console.error("Error en la página al iniciar el pago:", err);
            toast.error('Hubo un problema al redirigir al pago. Intente nuevamente.');
        }
    };

    if (orderPlaced) {
        return (
            <Container maxWidth="sm" sx={{
                py: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh'
            }}>
                <Paper elevation={0} sx={{
                    p: 6,
                    textAlign: 'center',
                    background: 'transparent'
                }}>
                    <CheckCircleOutlineIcon sx={{
                        fontSize: 80,
                        color: 'success.main',
                        mb: 3,
                        opacity: 0.9
                    }} />
                    <Typography variant="h4" gutterBottom sx={{
                        fontWeight: 400,
                        color: 'text.primary',
                        mb: 2,
                        letterSpacing: '-0.5px'
                    }}>
                        Pedido confirmado
                    </Typography>
                    <Typography variant="body1" sx={{
                        color: 'text.secondary',
                        mb: 4,
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                    }}>
                        Su pedido ha sido procesado exitosamente.
                        Será redirigido al portal de pago seguro.
                    </Typography>

                    {placedOrderDetails && (
                        <Box sx={{
                            mb: 4,
                            p: 3,
                            backgroundColor: alpha(theme.palette.success.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            borderRadius: 2
                        }}>
                            <Typography variant="body2" sx={{
                                fontWeight: 500,
                                color: 'text.primary',
                                mb: 1
                            }}>
                                ID de pedido: {placedOrderDetails._id}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Total: {formatPrice(placedOrderDetails.totalPrice)}
                            </Typography>
                        </Box>
                    )}

                    <Button
                        variant="outlined"
                        onClick={() => navigate('/profile')}
                        sx={{
                            px: 5,
                            py: 1.5,
                            borderRadius: 1,
                            borderWidth: 2,
                            '&:hover': {
                                borderWidth: 2
                            }
                        }}
                    >
                        Ver historial de pedidos
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{
            py: 6,
            minHeight: '100vh'
        }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Typography variant="h1" sx={{
                    fontSize: '2.5rem',
                    fontWeight: 400,
                    color: 'text.primary',
                    mb: 6,
                    textAlign: 'center',
                    letterSpacing: '-0.5px'
                }}>
                    Finalizar compra
                </Typography>

                <Grid container spacing={6}>
                    {/* Order Summary - LEFT SIDE */}
                    <Grid item xs={12} lg={5}>
                        <Box sx={{
                            position: 'sticky',
                            top: 24
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <ReceiptIcon sx={{
                                    color: 'primary.main',
                                    mr: 2,
                                    fontSize: 28
                                }} />
                                <Typography variant="h5" sx={{
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}>
                                    Resumen del pedido
                                </Typography>
                            </Box>

                            <Paper elevation={3} sx={{
                                p: 4,
                                borderRadius: 3,
                                backgroundColor: 'white',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                            }}>
                                <List sx={{ mb: 2 }}>
                                    {cartItems.map((item) => {
                                        const priceWithTax = item.product ?
                                            (taxRegime === 'simplified' ? Math.round(item.priceAtSale) : calculatePriceWithTax(item.priceAtSale, item.product.iva)) :
                                            item.priceAtSale;

                                        return (
                                            <ListItem key={item.product._id} disablePadding sx={{
                                                py: 2,
                                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    width: '100%'
                                                }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body1" sx={{
                                                            fontWeight: 600,
                                                            color: 'text.primary',
                                                            mb: 0.5
                                                        }}>
                                                            {item.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{
                                                            color: 'text.secondary',
                                                            display: 'block'
                                                        }}>
                                                            Cantidad: {item.quantity} • {formatPrice(priceWithTax)} c/u
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body1" sx={{
                                                        fontWeight: 700,
                                                        color: 'text.primary'
                                                    }}>
                                                        {formatPrice(item.quantity * priceWithTax)}
                                                    </Typography>
                                                </Box>
                                            </ListItem>
                                        );
                                    })}
                                </List>

                                <Divider sx={{ my: 3 }} />

                                {/* Shipping Cost Info */}
                                <Box sx={{
                                    mb: 3,
                                    p: 2,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <LocalShippingIcon sx={{
                                            fontSize: 20,
                                            color: 'primary.main',
                                            mr: 1
                                        }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Costo de envío
                                        </Typography>
                                    </Box>

                                    {!selectedProvince ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <WarningAmberIcon sx={{
                                                fontSize: 16,
                                                color: 'warning.main',
                                                mr: 1
                                            }} />
                                            <Typography variant="caption" sx={{ color: 'warning.main' }}>
                                                Selecciona tu provincia para calcular el envío
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                {taxRegime === 'simplified' ? 'Envío' : 'Envío base'}: {formatPrice(breakdown.shippingBase)}
                                            </Typography>
                                            {taxRegime !== 'simplified' && (
                                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                    Impuesto (13%): {formatPrice(breakdown.shippingTax)}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mt: 1 }}>
                                                Total envío: {formatPrice(shippingCost)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mt: 1 }}>
                                                Envío por Correos de Costa Rica a todo el territorio nacional.
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                                Datos calculados por Correos de Costa Rica.
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500, display: 'block', mt: 1 }}>
                                                {shippingMessage}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{taxRegime === 'simplified' ? 'Productos' : 'Subtotal Productos'}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(breakdown.itemsSubtotal)}</Typography>
                                    </Box>
                                    {taxRegime !== 'simplified' && (
                                        <Box display="flex" justifyContent="space-between" mb={1.5}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>IVA Productos</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(breakdown.itemsTax)}</Typography>
                                        </Box>
                                    )}
                                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{taxRegime === 'simplified' ? 'Envío' : 'Envío (Base)'}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(breakdown.shippingBase)}</Typography>
                                    </Box>
                                    {taxRegime !== 'simplified' && (
                                        <Box display="flex" justifyContent="space-between" mb={1.5}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>IVA Envío (13%)</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(breakdown.shippingTax)}</Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 4
                                }}>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 700,
                                        color: 'text.primary'
                                    }}>
                                        Total
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                        {formatPrice(breakdown.total)}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Shipping Details Form - RIGHT SIDE */}
                    <Grid item xs={12} lg={7}>
                        <Box sx={{ mb: 5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <LocalShippingIcon sx={{
                                    color: 'primary.main',
                                    mr: 2,
                                    fontSize: 28
                                }} />
                                <Typography variant="h5" sx={{
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}>
                                    Información de envío
                                </Typography>
                            </Box>

                            <Paper elevation={3} sx={{
                                p: 4,
                                borderRadius: 3,
                                backgroundColor: 'white',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                            }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Nombre completo"
                                            name="name"
                                            value={shippingDetails.name}
                                            onChange={handleShippingChange}
                                            onBlur={() => handleFieldBlur('name')}
                                            error={shouldShowError('name', shippingDetails.name)}
                                            helperText={shouldShowError('name', shippingDetails.name) ? "Este campo es requerido" : ""}
                                            fullWidth
                                            required
                                            variant="outlined"
                                            size="medium"
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Correo electrónico"
                                            name="email"
                                            type="email"
                                            value={shippingDetails.email}
                                            onChange={handleShippingChange}
                                            onBlur={() => handleFieldBlur('email')}
                                            error={shouldShowError('email', shippingDetails.email)}
                                            helperText={shouldShowError('email', shippingDetails.email) ? "Este campo es requerido" : ""}
                                            fullWidth
                                            required
                                            variant="outlined"
                                            size="medium"
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Teléfono"
                                            name="phone"
                                            value={shippingDetails.phone}
                                            onChange={handleShippingChange}
                                            onBlur={() => handleFieldBlur('phone')}
                                            error={shouldShowError('phone', shippingDetails.phone)}
                                            helperText={shouldShowError('phone', shippingDetails.phone) ? "Este campo es requerido" : ""}
                                            fullWidth
                                            required
                                            variant="outlined"
                                            size="medium"
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                            Provincia, Cantón y Distrito *
                                        </Typography>
                                        <CRAddressSelector
                                            provincia={selectedProvince}
                                            setProvincia={setSelectedProvince}
                                            canton={selectedCanton}
                                            setCanton={setSelectedCanton}
                                            distrito={selectedDistrito}
                                            setDistrito={setSelectedDistrito}
                                            icon={null}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Otras señas (Calle, número, urbanización, punto de referencia, etc.)"
                                            name="address"
                                            value={shippingDetails.address}
                                            onChange={handleShippingChange}
                                            onBlur={() => handleFieldBlur('address')}
                                            error={shouldShowError('address', shippingDetails.address)}
                                            helperText={shouldShowError('address', shippingDetails.address) ? "Este campo es requerido" : ""}
                                            fullWidth
                                            required
                                            variant="outlined"
                                            size="medium"
                                            multiline
                                            rows={2}
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <PaymentIcon sx={{
                                    color: 'primary.main',
                                    mr: 2,
                                    fontSize: 28
                                }} />
                                <Typography variant="h5" sx={{
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}>
                                    Método de pago
                                </Typography>
                            </Box>

                            <Paper elevation={3} sx={{
                                p: 4,
                                borderRadius: 3,
                                backgroundColor: 'white',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                            }}>
                                <Box sx={{
                                    p: 3,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                    border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    borderRadius: 2
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        color: 'primary.main',
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <PaymentIcon sx={{ mr: 1.5, fontSize: 24 }} />
                                        Tarjeta de crédito/débito
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        color: 'text.secondary',
                                        mb: 2,
                                        lineHeight: 1.6
                                    }}>
                                        Será redirigido a una plataforma de pago segura para completar su transacción.
                                        Todos los datos están protegidos con encriptación SSL.
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleInitiatePayment}
                            disabled={
                                cartItems.length === 0 ||
                                loading ||
                                !shippingDetails.name ||
                                !shippingDetails.phone ||
                                !shippingDetails.address ||
                                !shippingDetails.email ||
                                !shippingDetails.city ||
                                !selectedProvince ||
                                user?.isBlocked
                            }
                            sx={{
                                mt: 4,
                                py: 2,
                                backgroundColor: '#f3e300ff',
                                color: 'black',
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                '&:hover': {
                                    backgroundColor: '#cdc00fff',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 20px rgba(38, 60, 92, 0.3)'
                                },
                                '&:disabled': {
                                    backgroundColor: 'grey.300',
                                    color: 'grey.500',
                                    transform: 'none'
                                }
                            }}
                        >
                            {paymentButtonLoading ? (
                                <CircularProgress size={24} sx={{ color: 'black' }} />
                            ) : (
                                'Proceder al pago seguro'
                            )}

                            {paymentButtonLoading ? (
                                console.log("procesando pago")
                            ) : (
                                <PaymentIcon sx={{
                                    color: 'black',
                                    ml: 2,
                                    fontSize: 28
                                }} />
                            )}

                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default CheckoutPage;