import React, { useState, useEffect } from 'react';
// ✅ 1. Se importa useMediaQuery para detectar el tamaño de la pantalla
import { Box, styled, useTheme, Grid, useMediaQuery } from '@mui/material';

// --- Contenedor Principal (SIN CAMBIOS) ---
const MainImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '32px',
  background: '#ffffff',
  border: '1px solid rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.08)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
}));

const StyledMainImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  padding: '40px', // Standardized padding for absolute normalization
  transition: 'all 0.4s ease-in-out',
});

const StyledThumbnail = styled(Box)(({ theme, isSelected }) => ({
  width: '70px',
  height: '70px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: '12px',
  cursor: 'pointer',
  background: '#ffffff',
  border: isSelected ? `2px solid #263C5C` : `1px solid rgba(0, 0, 0, 0.08)`,
  opacity: isSelected ? 1 : 0.7,
  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
  '&:hover': {
    borderColor: isSelected ? '#263C5C' : 'rgba(0, 0, 0, 0.2)',
    opacity: 1,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
  },
}));

const StyledThumbnailImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  padding: '4px',
});

const ProductImageCarousel = ({ imageUrls = [], productName }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('sm'));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (imageUrls.length > 0 && selectedImageIndex >= imageUrls.length) {
      setSelectedImageIndex(0);
    } else if (imageUrls.length === 0) {
      setSelectedImageIndex(0);
    }
  }, [imageUrls, selectedImageIndex]);

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <MainImageContainer>
        <StyledMainImage src="https://placehold.co/600x600/FFFFFF/E0E0E0?text=No+Image" alt="No disponible" />
      </MainImageContainer>
    );
  }

  const renderThumbnails = () => imageUrls.map((img, index) => (
    <Grid item key={index}>
      <StyledThumbnail
        isSelected={index === selectedImageIndex}
        onClick={() => setSelectedImageIndex(index)}
      >
        <StyledThumbnailImage src={img.secure_url} alt={`Thumbnail ${index + 1}`} />
      </StyledThumbnail>
    </Grid>
  ));

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column-reverse', sm: 'row' },
      gap: { xs: 2, sm: 3 },
      width: '100%',
      alignItems: 'flex-start',
    }}>
      {/* Thumbnails Sidebar */}
      {imageUrls.length > 1 && (
        <Box sx={{
          width: { xs: '100%', sm: '80px' },
          flexShrink: 0,
          overflowX: { xs: 'auto', sm: 'visible' },
          overflowY: { xs: 'visible', sm: 'auto' },
          maxHeight: { sm: '500px' },
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          pb: { xs: 1, sm: 0 }
        }}>
          <Grid
            container
            direction={{ xs: 'row', sm: 'column' }}
            spacing={1.5}
            sx={{ flexWrap: 'nowrap' }}
          >
            {renderThumbnails()}
          </Grid>
        </Box>
      )}

      {/* Main Image View */}
      <Box sx={{
        flex: 1,
        minWidth: 0, // Important for flexbox overflow
        width: '100%'
      }}>
        <MainImageContainer>
          <StyledMainImage
            key={selectedImageIndex}
            src={imageUrls[selectedImageIndex]?.secure_url || "https://placehold.co/600x600/FFFFFF/E0E0E0?text=No+Image"}
            alt={productName}
            sx={{
              animation: 'fadeIn 0.5s ease-in-out',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 }
              }
            }}
          />
        </MainImageContainer>
      </Box>
    </Box>
  );
};

export default ProductImageCarousel;