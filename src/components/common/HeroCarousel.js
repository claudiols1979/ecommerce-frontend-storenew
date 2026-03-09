import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Box, Typography, Button, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useHeroCarousel } from "../../contexts/HeroCarouselContext";

// Componente estilizado para el contenedor del slide
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
  background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6))",
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

const HeroCarousel = () => {
  const navigate = useNavigate();
  const { slides, loading, error } = useHeroCarousel();

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: 250, sm: 350, md: 500 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="h6" color="textSecondary">
          Cargando carrusel...
        </Typography>
      </Box>
    );
  }

  // Determinar qué slides mostrar (el contexto ya maneja el fallback a defaultSlides)
  const displaySlides = slides;

  return (
    <Box
      sx={{
        width: "100%",
        mb: 4,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 3,
      }}
    >
      <Carousel
        showArrows={true}
        showStatus={false}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={5000}
        stopOnHover={true}
        swipeable={true}
        emulateTouch={true}
      >
        {displaySlides.map((slide, index) => (
          <Box key={slide._id || index} sx={{ position: "relative" }}>
            {slide.video ? (
              <Box
                component="video"
                src={slide.video}
                autoPlay
                loop
                muted
                playsInline
                sx={{
                  width: "100%",
                  height: { xs: 250, sm: 350, md: 500 },
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Box
                component="img"
                src={slide.image}
                alt={slide.alt}
                sx={{
                  width: "100%",
                  height: { xs: 250, sm: 350, md: 500 },
                  objectFit: "cover",
                  display: "block",
                  boxSizing: "border-box",
                  border: "none",
                  outline: "none",
                }}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x500/cccccc/969696?text=Imagen+no+disponible";
                }}
              />
            )}
            <CarouselSlideContent>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  fontSize: { xs: "1.5rem", sm: "2.5rem", md: "3rem" },
                }}
              >
                {slide.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  maxWidth: { xs: "90%", md: "60%" },
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                }}
              >
                {slide.description}
              </Typography>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate(slide.buttonLink)}
                sx={{
                  px: { xs: 3, sm: 5 },
                  py: { xs: 1, sm: 1.5 },
                  borderRadius: "50px",
                  color: "white",
                  borderColor: "rgba(255, 255, 255, 0.8)",
                  borderWidth: "1.5px",
                  backgroundColor: "transparent",
                  textTransform: "none",
                  fontWeight: 600,
                  transition: "all 0.3s ease !important",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "& *": {
                    pointerEvents: "none",
                  },
                }}
              >
                {slide.buttonText}
              </Button>
            </CarouselSlideContent>
          </Box>
        ))}
      </Carousel>
    </Box>
  );
};

export default HeroCarousel;
