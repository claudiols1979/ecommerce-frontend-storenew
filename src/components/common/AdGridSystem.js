import React, { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDepartmental } from "../../contexts/DepartmentalContext";
import { useAdGrid } from "../../contexts/AdGridContext"; // Importar el contexto

// Componentes styled correctamente definidos
const PictureGridContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: 0,
  padding: theme.spacing(0, 2),
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    padding: 0,
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: "12px",
  height: "100%",
  minHeight: "300px",
  cursor: "pointer",
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  aspectRatio: "1 / 1", // Fuerza relación de aspecto cuadrada
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
    "& .image-overlay": {
      opacity: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    "& img": {
      transform: "scale(1.05)",
    },
  },
  [theme.breakpoints.down("md")]: {
    minHeight: "250px",
  },
  [theme.breakpoints.down("sm")]: {
    minHeight: "200px",
    borderRadius: 0,
  },
}));

const StyledImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.5s ease",
});

const Overlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  opacity: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2),
  transition: "opacity 0.3s ease, background-color 0.3s ease",
  color: "white",
  textAlign: "center",
}));

const ShopButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: "white",
  color: theme.palette.text.primary,
  fontWeight: "bold",
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
    transform: "translateY(-2px)",
  },
  transition: "transform 0.2s ease",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: "center",
  fontWeight: "700",
  position: "relative",
  "&:after": {
    content: '""',
    display: "block",
    width: "60px",
    height: "4px",
    backgroundColor: theme.palette.primary.main,
    margin: `${theme.spacing(2)} auto 0`,
    borderRadius: "2px",
  },
}));

const AdGridSystem = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loadedImages, setLoadedImages] = useState({});
  const { fetchDepartmentalProducts } = useDepartmental();
  const { gridItems, loading, processCloudinaryUrl } = useAdGrid(); // Usar el contexto
  const [activeDepartmentIndex, setActiveDepartmentIndex] = useState(1);
  const navigate = useNavigate();

  const handleScroll = (e) => {
    if (!isMobile) return;
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth - 40; // Aproximación por el gap/padding
    const index = Math.round(scrollLeft / width) + 1;
    if (index !== activeDepartmentIndex && index > 0 && index <= processedGridItems.length) {
      setActiveDepartmentIndex(index);
    }
  };

  const scrollToDepartment = (index) => {
    const container = document.getElementById("department-slider");
    if (container) {
      const width = container.offsetWidth - 40;
      container.scrollTo({
        left: (index - 1) * width,
        behavior: "smooth",
      });
    }
  };

  // Procesar las URLs de las imágenes
  const processedGridItems = gridItems.map((item) => ({
    ...item,
    image: processCloudinaryUrl(item.image),
    url: processCloudinaryUrl(item.image), // Para compatibilidad
  }));

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  const handleViewProducts = (department) => {
    navigate("/products");

    setTimeout(() => {
      fetchDepartmentalProducts({ department: department }, 1, 20);
    }, 100);
  };

  if (loading) {
    return (
      <PictureGridContainer>
        <SectionTitle variant="h4" component="h4">
          Departamentos
        </SectionTitle>
        <Grid
          container
          spacing={3}
          sx={{
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            justifyContent: "center",
          }}
        >
          {[...Array(1)].map((_, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              key={index}
              sx={{
                height: { xs: "250px", sm: "300px", md: "350px" },
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ImageContainer>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "grey.300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Cargando...
                  </Typography>
                </Box>
              </ImageContainer>
            </Grid>
          ))}
        </Grid>
      </PictureGridContainer>
    );
  }

  return (
    <Fragment>
      <SectionTitle variant="h4" component="h4">
        Departamentos
      </SectionTitle>
      {isMobile && processedGridItems.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mb: 2,
            px: 2,
          }}
        >
          {processedGridItems.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => scrollToDepartment(idx + 1)}
              sx={{
                height: "4px",
                flex: 1,
                maxWidth: "40px",
                borderRadius: "2px",
                cursor: "pointer",
                bgcolor: activeDepartmentIndex === idx + 1 ? "transparent" : "rgba(0,0,0,0.8)",
                background:
                  activeDepartmentIndex === idx + 1
                    ? "linear-gradient(90deg, #A855F7 0%, #F72585 100%)"
                    : "none",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Box>
      )}
      <PictureGridContainer sx={{ position: "relative" }}>
        {isMobile && processedGridItems.length > 1 && (
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              right: 15,
              top: "55%", 
              transform: "translateY(-50%)",
              zIndex: 10,
              pointerEvents: "none",
              flexDirection: "column",
              alignItems: "center",
              opacity: activeDepartmentIndex === 1 ? 0.9 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backdropFilter: "blur(4px)",
                animation: "swipeHintDept 2s infinite",
              }}
            >
              <Typography sx={{ color: "white", fontSize: "1.4rem", fontWeight: "bold" }}>
                ←
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "white",
                mt: 0.5,
                fontWeight: 800,
                textShadow: "0 1px 3px rgba(0,0,0,0.9)",
              }}
            >
              Desliza
            </Typography>
            <style>
              {`
                @keyframes swipeHintDept {
                  0% { transform: translateX(0); opacity: 0; }
                  50% { transform: translateX(-15px); opacity: 1; }
                  100% { transform: translateX(0); opacity: 0; }
                }
              `}
            </style>
          </Box>
        )}
        <Box
          id="department-slider"
          sx={{
            display: { xs: "flex", md: "grid" },
            gridTemplateColumns: {
              md: processedGridItems.length === 1 ? "1fr" :
                processedGridItems.length === 2 ? "repeat(2, 1fr)" :
                  processedGridItems.length === 3 ? "repeat(3, 1fr)" :
                    "repeat(auto-fit, minmax(280px, 1fr))"
            },
            gap: { xs: 1.5, md: 3 },
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            overflowX: { xs: "auto", md: "visible" },
            scrollSnapType: { xs: "x mandatory", md: "none" },
            pb: { xs: 2, md: 0 },
            px: { xs: 0, md: 0 },
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          onScroll={handleScroll}
        >
          {processedGridItems.map((item, index) => (
            <Box
              key={item._id || index}
              sx={{
                height: { xs: "250px", sm: "300px", md: "350px" },
                display: "flex",
                justifyContent: "center",
                scrollSnapAlign: { xs: "center", md: "none" },
                minWidth: { xs: "calc(100% - 60px)", sm: "300px", md: "auto" },
                flexShrink: 0,
              }}
            >
              <Fade in={true} timeout={800}>
                <ImageContainer>
                  <StyledImage
                    src={item.image || item.url}
                    alt={item.alt || item.title}
                    onLoad={() => handleImageLoad(index)}
                    onClick={() => handleViewProducts(item.department)}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x600/E0E0E0/333333?text=" + encodeURIComponent(item.title || "No Image");
                    }}
                  />
                  <Overlay
                    sx={{
                      "&:hover": {
                        opacity: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                      },
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                        mb: 2,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <ShopButton
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProducts(item.department);
                      }}
                    >
                      Comprar
                    </ShopButton>
                  </Overlay>
                </ImageContainer>
              </Fade>
            </Box>
          ))}
        </Box>
      </PictureGridContainer>
    </Fragment>
  );
};

export default AdGridSystem;
