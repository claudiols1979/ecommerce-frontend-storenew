import React from 'react';
import { Box, Typography } from '@mui/material';
import { useConfig } from '../../contexts/ConfigContext';

// --- ANIMACIÓN CORREGIDA Y MEJORADA ---
// La animación mueve el contenedor del texto de su posición inicial (0%)
// a una posición donde la primera mitad ha desaparecido por la izquierda (-50%).
const marqueeAnimation = {
  '@keyframes marquee': {
    '0%': { transform: 'translateX(0%)' },
    '100%': { transform: 'translateX(-50%)' },
  },
};

const PromotionalBanner = () => {
  const { promotionBannerMessage } = useConfig();

  // El texto de la promoción, para poder duplicarlo fácilmente.
  const promoText = (
    <Typography
      variant="subtitle1"
      component="span" // Usamos span para que sea parte del flujo del texto
      sx={{
        // Cada instancia del texto ocupa el 50% del contenedor animado
        width: '50%',
        color: '#ffffffff',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Centra el contenido dentro de su 50% de espacio
        flexShrink: 0, // Evita que el texto se encoja
      }}
    >
      {promotionBannerMessage}
    </Typography>
  );

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(168, 85, 247, 0.85) 50%, rgba(247, 37, 133, 0.85) 100%) !important',
      backdropFilter: 'blur(8px) !important',
      width: '98%',
      py: 1.5,
      mx: 'auto',
      overflow: 'hidden',
      whiteSpace: 'whitespace-nowrap',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3) !important',
      mb: 1,
      mt: 1,
      borderRadius: 2,
      zIndex: (theme) => theme.zIndex.drawer + 2,
    }}>
      {/* --- CONTENEDOR DE LA ANIMACIÓN --- */}
      <Box
        sx={{
          ...marqueeAnimation,
          display: 'flex', // Crucial para alinear los hijos en una fila
          width: '200%',   // El contenedor es el doble de ancho que la pantalla
          animation: 'marquee 10s linear infinite', // Animación más rápida
        }}
      >
        {/* --- CORRECCIÓN: Se duplica el contenido para un bucle infinito --- */}
        {promoText}
        {promoText}
      </Box>
    </Box>
  );
};

export default PromotionalBanner;