import React from 'react';
import { Container, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Paper, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Helmet } from 'react-helmet-async';
import AuthBranding from '../components/common/AuthBranding'; // Reutilizamos el componente de branding

const PrivacyPolicyPage = () => {
  const theme = useTheme();

  // Estilo para los acordeones que coincide con el tema de lujo
  const accordionStyle = {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    color: 'black',
    boxShadow: 'none',
    border: '1px solid rgba(148, 145, 145, 1)',
    borderRadius: '8px !important', // !important para asegurar que sobreescriba el default
    mb: 2,
    '&:before': {
      display: 'none', // Elimina la línea divisoria por defecto de MUI
    },
  };

  const accordionSummaryStyle = {
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
    },
    '& .MuiTypography-root': {
      fontWeight: 'bold',
      color: '#263C5C', // Dorado para los títulos
    },
    '& .MuiSvgIcon-root': {
      color: '#263C5C', // Dorado para el icono de expandir
    },
  };

  return (
    <>
      <Helmet>
        <title>Política de Privacidad - Software Factory ERP</title>
        <meta name="description" content="Conoce cómo se protege y gestiona tus datos personales. Nuestra política de privacidad para revendedores en Costa Rica." />
      </Helmet>

      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, rgba(49, 0, 138, 0.9) 0%, rgba(168, 85, 247, 0.9) 50%, rgba(247, 37, 133, 0.9) 100%)',
        py: { xs: 4, md: 10 },
        px: 2,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Blur Orbs */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(168, 85, 247, 0.3)', filter: 'blur(100px)', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: -150, left: -150, width: 500, height: 500, borderRadius: '50%', background: 'rgba(247, 37, 133, 0.2)', filter: 'blur(120px)', zIndex: 0 }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 6 },
              borderRadius: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 40px 100px rgba(0, 0, 0, 0.25)',
              animation: 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(40px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
              <AuthBranding />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              sx={{
                textAlign: 'center',
                mb: 2,
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-0.02em',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Política de Privacidad
            </Typography>

            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                mb: 6,
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontSize: '0.8rem'
              }}
            >
              Última actualización: 02 de Julio, 2025
            </Typography>

            <Typography variant="body1" sx={{ mb: 6, color: 'white', lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'center' }}>
              En Tienda en linea, valoramos y respetamos tu privacidad. Esta política detalla cómo recopilamos, usamos, protegemos y gestionamos tu información personal. Tu confianza es nuestro activo más importante.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                {
                  id: 1,
                  title: "1. Información que Recopilamos",
                  content: (
                    <>
                      Recopilamos información que nos proporcionas directamente para poder ofrecerte nuestros servicios de manera efectiva:
                      <br /><br />
                      • <strong>Datos de Registro:</strong> Nombre, apellido, correo electrónico, número de teléfono y dirección física.
                      <br />
                      • <strong>Datos de Transacción:</strong> Detalles de los productos y pedidos realizados.
                      <br />
                      • <strong>Información de Autenticación:</strong> Acceso seguro a tu perfil de revendedor.
                    </>
                  )
                },
                {
                  id: 2,
                  title: "2. Cómo Usamos tu Información",
                  content: (
                    <>
                      Utilizamos tu información exclusivamente para los siguientes propósitos:
                      <br /><br />
                      • <strong>Procesar tus Pedidos:</strong> Gestión integral desde el carrito hasta la entrega final.
                      <br />
                      • <strong>Comunicación:</strong> Soporte personalizado y notificaciones relevantes.
                      <br />
                      • <strong>Personalización:</strong> Aplicación de precios y beneficios exclusivos para revendedores.
                      <br />
                      • <strong>Seguridad:</strong> Blindaje de tu cuenta y prevención de accesos no autorizados.
                    </>
                  )
                },
                {
                  id: 3,
                  title: "3. Cómo Compartimos tu Información",
                  content: (
                    <>
                      Tu privacidad es primordial. <strong>No vendemos ni alquilamos tu información personal a terceros.</strong> Solo compartimos datos con:
                      <br /><br />
                      • <strong>Proveedores de Servicios:</strong> Logística confiable para asegurar tus entregas.
                      <br />
                      • <strong>Cumplimiento Legal:</strong> Únicamente por requerimiento de autoridades competentes.
                    </>
                  )
                },
                {
                  id: 4,
                  title: "4. Seguridad de tus Datos",
                  content: "Implementamos medidas de seguridad técnicas y organizativas de vanguardia para proteger tu información. Tus credenciales se gestionan bajo estándares internacionales de encriptación."
                },
                {
                  id: 5,
                  title: "5. Tus Derechos",
                  content: "Tienes pleno derecho a acceder, corregir o solicitar la eliminación de tus datos personales. Gestiona tu información con total autonomía desde tu panel de control."
                }
              ].map((section) => (
                <Accordion
                  key={section.id}
                  elevation={0}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    borderRadius: '24px !important',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-expanded': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                      mb: 2
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#F72585', fontSize: '2rem' }} />}
                    sx={{ px: 4, py: 1 }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
                      {section.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 4, pb: 4 }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.7, fontSize: '1.05rem' }}>
                      {section.content}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default PrivacyPolicyPage;