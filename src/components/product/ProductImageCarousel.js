import React, { useState, useEffect } from "react";
// ✅ 1. Se importa useMediaQuery para detectar el tamaño de la pantalla
import { Box, styled, useTheme, Grid, useMediaQuery } from "@mui/material";

// --- Contenedor Principal (SIN CAMBIOS) ---
const MainImageContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  aspectRatio: "1 / 1",
  borderRadius: "32px",
  background: "#ffffff",
  border: "1px solid rgba(0, 0, 0, 0.04)",
  overflow: "hidden",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.04)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:hover": {
    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.08)",
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
}));

const StyledMainImage = styled("img")({
  maxWidth: "100%",
  maxHeight: "100%",
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: "20px", // Reduced padding to maximize image visibility
  transition: "all 0.4s ease-in-out",
});

const MobileCarouselContainer = styled(Box)({
  display: "flex",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  width: "100%",
  borderRadius: "24px",
});

const MobileImageWrapper = styled(Box)({
  flex: "0 0 100%",
  scrollSnapAlign: "start",
  aspectRatio: "1 / 1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#ffffff",
  overflow: "hidden",
});

const StyledThumbnail = styled(Box)(({ theme, isSelected }) => ({
  width: "70px",
  height: "70px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  borderRadius: "12px",
  cursor: "pointer",
  background: "#ffffff",
  // Use border for unselected, but inset shadow for selected to avoid clipping
  border: `1px solid ${isSelected ? "#263C5C" : "rgba(0, 0, 0, 0.08)"}`,
  boxShadow: isSelected 
    ? "inset 0 0 0 2px #263C5C, 0 4px 12px rgba(0, 0, 0, 0.1)" 
    : "none",
  opacity: isSelected ? 1 : 0.7,
  transform: isSelected ? "scale(1.05)" : "scale(1)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    borderColor: isSelected ? "#263C5C" : "rgba(0, 0, 0, 0.2)",
    opacity: 1,
    transform: "translateY(-2px) scale(1.05)",
    boxShadow: isSelected 
      ? "inset 0 0 0 2px #263C5C, 0 6px 16px rgba(0, 0, 0, 0.08)"
      : "0 6px 16px rgba(0, 0, 0, 0.08)",
  },
}));

const StyledThumbnailImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  padding: "4px",
});

const ProductImageCarousel = ({ imageUrls = [], productName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const scrollContainerRef = React.useRef(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== selectedImageIndex) {
        setSelectedImageIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    if (imageUrls.length > 0 && selectedImageIndex >= imageUrls.length) {
      setSelectedImageIndex(0);
    } else if (imageUrls.length === 0) {
      setSelectedImageIndex(0);
    }
  }, [imageUrls, selectedImageIndex]);

  if (!imageUrls || imageUrls.length === 0) {
    const placeholder = "https://placehold.co/600x600/FFFFFF/E0E0E0?text=No+Image";
    return (
      <MainImageContainer>
        <StyledMainImage src={placeholder} alt="No disponible" />
      </MainImageContainer>
    );
  }

  // Mobile View: Swipable Carousel
  if (isMobile) {
    return (
      <Box sx={{ width: "100%", position: "relative" }}>
        <MobileCarouselContainer
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {imageUrls.map((img, index) => (
            <MobileImageWrapper key={index}>
              <StyledMainImage
                src={img.secure_url}
                alt={`${productName} - ${index + 1}`}
                sx={{ padding: "10px" }}
              />
            </MobileImageWrapper>
          ))}
        </MobileCarouselContainer>
        {imageUrls.length > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mt: 2,
            }}
          >
            {imageUrls.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: index === selectedImageIndex ? "primary.main" : "grey.300",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }

  // Desktop View: Sidebar Thumbnails + Main Image
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 3,
        width: "100%",
        alignItems: "flex-start",
      }}
    >
      {/* Thumbnails Sidebar */}
      {imageUrls.length > 1 && (
        <Box
          sx={{
            width: "80px",
            flexShrink: 0,
            maxHeight: "500px",
            overflowY: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            // Add padding to allow thumbnails to scale without clipping
            p: 1,
            ml: -1, // Offset padding to keep alignment
          }}
        >
          <Grid container direction="column" spacing={1.5}>
            {imageUrls.map((img, index) => (
              <Grid item key={index}>
                <StyledThumbnail
                  isSelected={index === selectedImageIndex}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <StyledThumbnailImage
                    src={img.secure_url}
                    alt={`Thumbnail ${index + 1}`}
                  />
                </StyledThumbnail>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Main Image View */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <MainImageContainer>
          <StyledMainImage
            key={selectedImageIndex}
            src={imageUrls[selectedImageIndex]?.secure_url}
            alt={productName}
            sx={{
              animation: "fadeIn 0.4s ease-in-out",
              "@keyframes fadeIn": {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          />
        </MainImageContainer>
      </Box>
    </Box>
  );
};

export default ProductImageCarousel;
