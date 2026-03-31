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
  borderRadius: "12px",
  cursor: "pointer",
  background: "#ffffff",
  position: "relative",
  zIndex: isSelected ? 2 : 1,
  boxSizing: "border-box", // Ensure border is included in dimensions
  // Reduced to 1px for a cleaner look as requested
  border: isSelected ? `1.5px solid #263C5C` : `1px solid rgba(0, 0, 0, 0.08)`,
  boxShadow: isSelected ? "0 4px 12px rgba(0, 0, 0, 0.08)" : "none",
  opacity: isSelected ? 1 : 0.7,
  transform: isSelected ? "scale(1.05)" : "scale(1)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    opacity: 1,
    transform: "translateY(-4px) scale(1.05)",
    zIndex: 3,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
    borderColor: isSelected ? "#263C5C" : "rgba(0, 0, 0, 0.2)",
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
    const placeholder = "/placeholder.png";
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

  // Desktop/Tablet View: Sidebar or Bottom Thumbnails + Main Image
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { sm: "column-reverse", lg: "row" },
        gap: { sm: 3, lg: 3 },
        width: "100%",
        alignItems: "center",
      }}
    >
      {/* Thumbnails Container */}
      {imageUrls.length > 1 && (
        <Box
          sx={{
            width: { sm: "100%", lg: "140px" },
            flexShrink: 0,
            maxHeight: { sm: "160px", lg: "600px" }, // Increased maxHeight for md to fit selected frame
            overflowX: { sm: "auto", lg: "hidden" },
            overflowY: { sm: "hidden", lg: "auto" },
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            px: { sm: 2, lg: 4 },
            py: { sm: 3, lg: 4 }, // Increased py to ensure selection border isn't clipped
          }}
        >
          <Grid
            container
            direction={{ sm: "row", lg: "column" }}
            spacing={2}
            justifyContent={{ sm: "center", lg: "flex-start" }}
            alignItems="center"
            wrap="nowrap"
            sx={{
              overflowX: { sm: "auto", lg: "visible" },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              pb: { sm: 1, lg: 0 }, // Extra padding bottom for horizontal scroll
            }}
          >
            {imageUrls.map((img, index) => (
              <Grid item key={index} sx={{ flexShrink: 0, p: { sm: "12px !important", lg: "8px !important" } }}>
                <StyledThumbnail
                  isSelected={index === selectedImageIndex}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    width: { sm: "75px", lg: "70px" }, // Slightly larger for tablet
                    height: { sm: "75px", lg: "70px" },
                  }}
                >
                  <StyledThumbnailImage
                    src={img.secure_url || "/placeholder.png"}
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                </StyledThumbnail>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Main Image View */}
      <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
        <MainImageContainer sx={{ minHeight: { sm: "400px", md: "500px", lg: "500px" } }}>
          <StyledMainImage
            src={imageUrls[selectedImageIndex]?.secure_url || "/placeholder.png"}
            alt={productName}
            onError={(e) => {
              e.target.src = "/placeholder.png";
            }}
            sx={{
              transition: "opacity 0.3s ease-in-out",
            }}
          />
        </MainImageContainer>
      </Box>
    </Box>
  );
};

export default ProductImageCarousel;
