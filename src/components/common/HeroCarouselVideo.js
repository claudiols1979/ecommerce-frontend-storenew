// components/HeroCarouselVideo.js
import React from "react";
import { Box, Typography, Button, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useHeroCarouselVideo } from "../../contexts/HeroCarouselVideoContext";

// Componente estilizado para el contenedor del slide (se mantiene sin cambios)
const CarouselSlideContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  color: theme.palette.common.white,
  background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6))", // Overlay oscuro
  padding: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
    alignItems: "flex-start",
    textAlign: "left",
    left: "10%",
    right: "unset",
    width: "80%",
  },
}));

const HeroCarouselVideo = () => {
  const navigate = useNavigate();
  const { videoData, loading, error, defaultVideo } = useHeroCarouselVideo();

  // Si está cargando o no hay datos, mostrar un estado de carga o el video por defecto
  if (loading) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 300, sm: 400, md: 650 },
          mb: { xs: 2, sm: 4 },
          borderRadius: { xs: 0, sm: 2 },
          overflow: "hidden",
          boxShadow: 3,
          backgroundColor: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        Cargando video...
      </Box>
    );
  }

  // Usar los datos del video del contexto (pueden ser del backend o por defecto)
  const currentVideo = videoData || defaultVideo;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 300, sm: 400, md: 650 },
        mb: { xs: 2, sm: 4 },
        borderRadius: { xs: 0, sm: 2 },
        overflow: "hidden",
        boxShadow: 3,
        backgroundColor: "black",
      }}
    >
      <video
        key={currentVideo?.video}
        src={currentVideo?.video}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
        }}
      >
        Tu navegador no soporta la etiqueta de video.
      </video>

      <CarouselSlideContent sx={{ zIndex: 2 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            mb: 1,
            fontWeight: 700,
            fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.5rem" },
          }}
        >
          {currentVideo.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            maxWidth: { xs: "90%", md: "50%" },
            fontSize: { xs: "1rem", sm: "1.2rem" },
          }}
        >
          {currentVideo.subtitle}
        </Typography>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate(currentVideo.buttonLink || "/products")}
          sx={{
            px: { xs: 4, sm: 6 },
            py: { xs: 1.5, sm: 2 },
            borderRadius: "50px",
            fontWeight: 600,
            borderColor: "rgba(255, 255, 255, 0.8)",
            borderWidth: "1.5px",
            backgroundColor: "transparent",
            color: "white",
            textTransform: "none",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              borderColor: "white",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          {currentVideo.buttonText}
        </Button>
      </CarouselSlideContent>
    </Box>
  );
};

export default HeroCarouselVideo;
