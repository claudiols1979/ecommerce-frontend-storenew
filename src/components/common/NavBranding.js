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
          variant="h5" // Tamaño más apropiado para un navbar
          component="div" // Componente 'div' ya que el 'a' es manejado por RouterLink
          sx={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 700,
            letterSpacing: "0.2em", // Un espaciado sutil
            color: "#fff",
            // No se especifica color para que herede el de la AppBar
          }}
        >
          ORIYINA⅃
          <Typography
            component="span"
            sx={{
              display: { xs: "block", md: "inline" }, // Wrap below on small, inline on md+
              fontFamily: '"Lato", sans-serif',
              fontWeight: 300,
              fontSize: { xs: "0.75rem", md: "0.875rem" }, // Slightly smaller font on mobile to fit nicely below
              letterSpacing: "0.1em",
              fontStyle: "italic",
              color: "#fff",
              mx: { xs: 0, md: 1 }, // Horizontal margin only on larger screens
              mt: { xs: -0.5, md: 0 }, // Pull it up slightly closer to the brand on mobile
            }}
          >
            Original como vos!
          </Typography>
        </Typography>
      </Box>
    </RouterLink>
  );
};

export default NavBranding;
