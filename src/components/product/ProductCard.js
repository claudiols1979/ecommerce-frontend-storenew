import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Box, CircularProgress, Tooltip, useTheme, Chip, Rating } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { toast } from 'react-toastify';
import { formatPrice } from '../../utils/formatters';
import { calculatePriceWithTax } from '../../utils/taxCalculations';

// Helper function to extract variant attributes from product code
const extractVariantAttributes = (code) => {
  if (!code) return { baseCode: '', attributes: [] };
  const firstUnderscoreIndex = code.indexOf('_');
  if (firstUnderscoreIndex === -1) {
    return { baseCode: code, attributes: [] };
  }
  const baseCode = code.substring(0, firstUnderscoreIndex);
  const attributesPart = code.substring(firstUnderscoreIndex + 1);
  const attributes = attributesPart.split('_');
  return { baseCode, attributes };
};

const ProductCard = ({ product, onAddToCart, isAdding }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { taxRegime } = useConfig();
  const theme = useTheme();

  // DETECTAR SI EL PRODUCTO TIENE VARIANTES
  const hasVariants = React.useMemo(() => {
    if (!product || !product.code) return false;
    const variantAttributes = extractVariantAttributes(product.code);
    return variantAttributes.attributes.length > 0;
  }, [product]);

  const displayPrice = React.useMemo(() => {
    if (!product || !product.resellerPrices) return null;
    if (isAuthenticated && user?.role === 'Revendedor') {
      return product.resellerPrices[user.resellerCategory] || product.resellerPrices.cat1;
    }
    return product.resellerPrices.cat1;
  }, [product, user, isAuthenticated]);

  // CALCULAR PRECIO CON IVA (0% si es simplificado)
  const priceWithTax = displayPrice !== null ?
    (taxRegime === 'simplified' ? Math.round(displayPrice) : calculatePriceWithTax(displayPrice, product.iva)) : null;

  // --- LÓGICA DE PRECIO TACHADO ---
  const originalPrice = React.useMemo(() => {
    if (!priceWithTax || !product.promotionalLabels || product.promotionalLabels.length === 0) {
      return null;
    }

    const discountLabel = product.promotionalLabels.find(label => label.name.includes('% OFF'));

    if (discountLabel) {
      const percentageMatch = discountLabel.name.match(/\d+/);
      if (percentageMatch) {
        const percentage = parseInt(percentageMatch[0]);
        if (!isNaN(percentage)) {
          return priceWithTax * (1 + (percentage / 100));
        }
      }
    }

    return null;
  }, [priceWithTax, product.promotionalLabels]);

  const handleAddToCartClick = () => {
    if (!isAuthenticated) {
      toast.info("Por favor, inicia sesión para añadir productos al carrito.");
      navigate('/login');
      return;
    }
    if (product.countInStock <= 0) {
      toast.error('Este producto está agotado.');
      return;
    }
    if (!displayPrice || displayPrice <= 0) {
      toast.error('No se puede añadir al carrito: Precio no disponible.');
      return;
    }
    if (hasVariants) {
      // Si tiene variantes, redirigir a la página de detalles
      handleViewDetails();
      return;
    }
    if (onAddToCart) {
      onAddToCart(product, 1);
    }
  };

  const isOutOfStock = product.countInStock <= 0;

  const handleViewDetails = () => {
    // ✅ SOLUCIÓN: Navegar solo con el ID, sin pasar productData
    navigate(`/products/${product._id}`);
  };

  const HTMLContent = ({ html, maxLength, ...typographyProps }) => {
    const stripHtml = (html) => html.replace(/<[^>]*>/g, '');

    let content = stripHtml(html || '');
    if (maxLength && content.length > maxLength) {
      content = content.substring(0, maxLength) + '...';
    }

    return (
      <Typography {...typographyProps}>
        {content || 'No description available.'}
      </Typography>
    );
  };


  return (
    <Card sx={{
      height: '100%',
      width: 250,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 4,
      boxShadow: theme.shadows[4],
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[8],
      },
      bgcolor: 'background.default',
      border: `1px solid ${theme.palette.grey[200]}`,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {product.promotionalLabels && product.promotionalLabels.length > 0 && (
        <Box
          sx={{
            position: 'absolute', top: '18px', left: '-35px',
            transform: 'rotate(-45deg)', zIndex: 1, width: '150px',
            py: 0.5, background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, #FFD700 90%)`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)', textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              color: 'common.black',
              textTransform: 'uppercase',
              fontSize: ['Últimas Unidades', 'Nuevo Ingreso', '10% OFF', '15% OFF', '20% OFF'].includes(product.promotionalLabels[0].name) ? '0.55rem' : '0.7rem'
            }}
          >
            {product.promotionalLabels[0].name.replace('OFF', 'Descuento')}
          </Typography>
        </Box>
      )}


      <CardMedia
        component="img"
        height="140"
        image={product.imageUrls?.[0]?.secure_url || 'https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image'}
        alt={product.name}
        sx={{
          objectFit: 'contain', p: 1, bgcolor: 'background.default',
          borderRadius: '12px 12px 0 0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          cursor: 'pointer'
        }}
        onClick={handleViewDetails}
      />

      <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography
          gutterBottom variant="h6"
          onClick={handleViewDetails}
          sx={{
            fontWeight: 700, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            fontSize: '0.95rem', color: 'primary.main', textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {product.name}
        </Typography>

        {/* Show variant chip if this product has variants */}
        {hasVariants && (
          <Chip
            label={`Ver variantes`}
            size="small"
            color="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            sx={{ mb: 1, fontSize: '0.65rem', height: '20px', cursor: 'pointer' }}
          />
        )}

        {/* --- SECCIÓN DE CALIFICACIÓN --- */}
        {product.numReviews > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
            <Rating
              name="read-only"
              value={product.averageRating || 0}
              precision={0.5}
              readOnly
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.numReviews})
            </Typography>
          </Box>
        )}

        {product.promotionalLabels && product.promotionalLabels.length > 1 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 1 }}>
            {product.promotionalLabels.slice(1).map((label) => (
              <Chip
                key={label._id}
                label={label.name.replace('OFF', 'Descuento')}
                size="small"
                onClick={(e) => e.preventDefault()}
                component="span"
                sx={{
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  height: '20px',
                  cursor: 'default', // Cursor normal
                  '&:hover': {
                    bgcolor: 'secondary.light', // Mismo color en hover
                    color: 'secondary.contrastText' // Mismo color de texto
                  },
                  '&:focus': {
                    bgcolor: 'secondary.light', // Mismo color cuando tiene foco
                    color: 'secondary.contrastText'
                  }
                }}
              />
            ))}
          </Box>
        )}

        {/* <Typography 
          variant="body2" color="text.secondary" 
          sx={{ 
            minHeight: 30, overflow: 'hidden', textOverflow: 'ellipsis', 
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            mb: 1, fontSize: '0.8rem', 
          }}
        >
          {product.shortDescription || (product.description ? product.description.substring(0, 60) + '...' : 'No description available.')}
        </Typography> */}
        <HTMLContent
          html={product.description}
          maxLength={60}
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: 30, overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            mb: 1, fontSize: '0.8rem',
          }}
        />

        {/* --- JSX DE PRECIOS --- */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {priceWithTax !== null ? formatPrice(priceWithTax) : 'Precio no disponible'}
            </Typography>
            {taxRegime !== 'simplified' && (
              <Typography variant="body2" color="text.secondary">
                IVA incluido
              </Typography>
            )}
            {originalPrice && (
              <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through', lineHeight: 1.1 }}>
                {formatPrice(originalPrice)}
              </Typography>
            )}
          </Box>
          {isOutOfStock && (
            <Typography variant="body2" color="error" sx={{ fontWeight: 700, ml: 1 }}>
              Sin Stock
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{
        p: 1.5,
        pt: 1,
        justifyContent: hasVariants ? 'center' : 'space-between', // Centrado para variantes
        borderTop: `1px solid ${theme.palette.grey[100]}`
      }}>

        {/* BOTÓN VER - SIEMPRE VISIBLE */}
        {!hasVariants && (
          <Button
            size="small"
            onClick={handleViewDetails}
            variant="outlined"
            startIcon={<VisibilityIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.75rem',
              py: 0.5,
              backgroundColor: '#ffffffff',
              color: 'black',
              '&:hover': {
                backgroundColor: '#263C5C',
                color: '#ffffffff',
                border: '1px solid #263C5C'
              }
            }}
          >
            Ver
          </Button>
        )}
        {/* BOTÓN DE AÑADIR/VER OPCIONES - CONDICIONAL */}
        {!hasVariants ? (
          <Tooltip title={isOutOfStock ? "Producto agotado" : (isAuthenticated ? "Añadir al carrito" : "Inicia sesión para comprar")}>
            <span>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleAddToCartClick}
                startIcon={isAdding ? <CircularProgress size={18} color="inherit" /> : (isAuthenticated ? <ShoppingCartIcon sx={{ fontSize: '1rem' }} /> : <LoginIcon sx={{ fontSize: '1rem' }} />)}
                disabled={isAdding || isOutOfStock || !displayPrice || displayPrice <= 0}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  minWidth: '80px',
                  background: `linear-gradient(45deg, #bb4343ff 30%, #bb4343ff 90%)`,
                  boxShadow: `0 3px 5px 2px rgba(33, 33, 33, .3)`,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(45deg, #ff0000ff 30%, #ff0000ff 90%)`,
                    boxShadow: `0 3px 8px 3px rgba(33, 33, 33, .4)`,
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    background: '#cccccc',
                    color: '#666666',
                  }
                }}
              >
                {isOutOfStock ? 'Agotado' : 'Añadir'}
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Este producto tiene variantes - Haz clic para ver opciones">
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={handleViewDetails}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.75rem',
                py: 0.5,
                minWidth: '110px',
                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`,
                boxShadow: `0 3px 5px 2px rgba(33, 33, 33, .3)`,
                color: 'white',
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                  boxShadow: `0 3px 8px 3px rgba(33, 33, 33, .4)`,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Ver Opciones
            </Button>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default ProductCard;