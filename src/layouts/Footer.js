import React from 'react';
import { Box, Typography, Container, Link as MuiLink, IconButton, Grid, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import NavBranding from '../components/common/NavBranding'; // Reutilizamos el componente de branding

const Footer = () => {
  const theme = useTheme();

  const linkStyle = {
    color: 'grey.200',
    textDecoration: 'none',
    display: 'block',
    mb: 1,
    transition: 'color 0.2s ease-in-out',
    '&:hover': {
      color: 'common.white',
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 4, sm: 6 }, // Aumentamos el padding vertical para más altura
        px: 2,
        mt: 'auto',
        //backgroundColor: 'rgba(38, 60, 92, 0.9)',
        background: 'linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(168, 85, 247, 0.85) 50%, rgba(247, 37, 133, 0.85) 100%) !important',
        backdropFilter: 'blur(8px)',
        color: 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* Columna 1: Branding y Redes Sociales */}
          <Grid item xs={12} sm={4} md={3}>
            <NavBranding />
            <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
              Productos 100% originales.
            </Typography>
            <Box>
              <MuiLink href="#" target="_self" rel="noopener noreferrer">
                <IconButton aria-label="Facebook" sx={{ color: 'grey.400', '&:hover': { color: 'common.white' } }}>
                  <FacebookIcon />
                </IconButton>
              </MuiLink>
              <MuiLink href="#" target="_self" rel="noopener noreferrer">
                <IconButton aria-label="Instagram" sx={{ color: 'grey.400', '&:hover': { color: 'common.white' } }}>
                  <InstagramIcon />
                </IconButton>
              </MuiLink>
            </Box>
          </Grid>

          {/* Columna 2: Navegación (con placeholders) */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 'bold', mb: 2 }}>Navegación</Typography>
            <MuiLink href="/" sx={linkStyle}>Inicio</MuiLink>
            <MuiLink href="/products" sx={linkStyle}>Productos</MuiLink>

          </Grid>

          {/* Columna 3: Legal */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 'bold', mb: 2 }}>Legal</Typography>
            <MuiLink href="/privacy" sx={linkStyle}>Política de Privacidad</MuiLink>
            <MuiLink href="/conditions" sx={linkStyle}>Términos de Servicio</MuiLink>
          </Grid>

          {/* Columna 4: Contacto (con placeholders) */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" sx={{ color: 'common.white', fontWeight: 'bold', mb: 2 }}>Contacto</Typography>
            <Typography variant="body2" sx={{ ...linkStyle, cursor: 'default' }}>Alajuela, Costa Rica</Typography>
            <Typography variant="body2" sx={{ ...linkStyle, cursor: 'default' }}>(506) 7231-7420</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Tienda en linea (demo) - Software Factory CR. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
