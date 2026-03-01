import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Link as RouterLink } from "react-router-dom"; // Para la funcionalidad de enlace

// Asegúrate de que las fuentes ya están instaladas en tu proyecto
import "@fontsource/playfair-display/700.css";
import "@fontsource/lato/300.css";

/**
 * Componente de Branding para la barra de navegación.
 * Muestra "Look & Smell" como un logo clicable que dirige al inicio.
 */
const NavBranding = () => {
  const theme = useTheme();

  return (
    // El RouterLink envuelve todo para hacerlo un enlace, eliminando la decoración de texto
    <RouterLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          variant="h4" // Tamaño más apropiado para un navbar
          component="div" // Componente 'div' ya que el 'a' es manejado por RouterLink
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            letterSpacing: "0.1em", // Un espaciado sutil
            color: "#fff",
            // No se especifica color para que herede el de la AppBar
          }}
        >
          Tienda
          <Typography
            component="span"
            variant="h4" // Mantenemos el mismo tamaño para el '&'
            sx={{
              fontFamily: '"Lato", sans-serif',
              fontWeight: 300,
              fontStyle: "italic",
              color: "#fff",
              mx: 1, // Margen horizontal reducido para un look más compacto
            }}
          >
            Linea
          </Typography>
          
        </Typography>
      </Box>
    </RouterLink>
  );
};

export default NavBranding;
