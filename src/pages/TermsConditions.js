import React from "react";
import {
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Helmet } from "react-helmet-async";
import AuthBranding from "../components/common/AuthBranding";

const TermsAndConditionsPage = () => {
  const theme = useTheme();

  // Estilo para los acordeones que coincide con el tema de la Política de Privacidad
  const accordionStyle = {
    backgroundColor: "rgba(255, 255, 255, 1)",
    color: "black",
    boxShadow: "none",
    border: "1px solid rgba(148, 145, 145, 1)",
    borderRadius: "8px !important",
    mb: 2,
    "&:before": {
      display: "none",
    },
  };

  const accordionSummaryStyle = {
    "& .MuiAccordionSummary-content": {
      margin: "12px 0",
    },
    "& .MuiTypography-root": {
      fontWeight: "bold",
      color: "#263C5C",
    },
    "& .MuiSvgIcon-root": {
      color: "#263C5C",
    },
  };

  return (
    <>
      <Helmet>
        <title>Términos y Condiciones - Software Factory ERP</title>
        <meta
          name="description"
          content="Lee los términos y condiciones para el uso de la plataforma. Reglas sobre cuentas, pedidos, precios y envíos."
        />
      </Helmet>

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background:
            "linear-gradient(135deg, rgba(49, 0, 138, 0.9) 0%, rgba(168, 85, 247, 0.9) 50%, rgba(247, 37, 133, 0.9) 100%)",
          py: { xs: 4, md: 10 },
          px: 2,
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Blur Orbs */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.3)",
            filter: "blur(100px)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(247, 37, 133, 0.2)",
            filter: "blur(120px)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 6 },
              borderRadius: "40px",
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              boxShadow: "0 40px 100px rgba(0, 0, 0, 0.25)",
              animation: "fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              "@keyframes fadeInUp": {
                from: { opacity: 0, transform: "translateY(40px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
              <AuthBranding />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 900,
                color: "white",
                letterSpacing: "-0.02em",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              Términos y Condiciones
            </Typography>

            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                mb: 6,
                color: "rgba(255, 255, 255, 0.8)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.8rem",
              }}
            >
              Última actualización: 02 de Julio, 2025
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 6,
                color: "white",
                lineHeight: 1.8,
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              Bienvenido/a a Tienda en linea. Al acceder y utilizar nuestra
              plataforma, usted acepta cumplir y estar sujeto/a a los siguientes
              términos y condiciones. Por favor, léalos cuidadosamente.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                {
                  id: 1,
                  title: "1. Aceptación de los Términos",
                  content:
                    "Al registrarse o utilizar esta plataforma, usted confirma que ha leído, entendido y aceptado estar legalmente vinculado a estos Términos y Condiciones y a nuestra Política de Privacidad. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.",
                },
                {
                  id: 2,
                  title: "2. Cuentas",
                  content: (
                    <>
                      • <strong>Elegibilidad:</strong> Para registrarse, debe
                      proporcionar información veraz, precisa y completa. Nos
                      reservamos el derecho de aprobar o rechazar cualquier
                      solicitud.
                      <br />
                      <br />• <strong>Seguridad:</strong> Usted es el único
                      responsable de mantener la confidencialidad de sus
                      credenciales. Cualquier actividad bajo su cuenta es su
                      responsabilidad.
                    </>
                  ),
                  defaultExpanded: true,
                },
                {
                  id: 3,
                  title: "3. Proceso de Pedido y Precios",
                  content: (
                    <>
                      • <strong>Precios:</strong> Los precios mostrados son
                      exclusivos y varían según la categoría asignada. El precio
                      final es el que se muestra al momento del checkout.
                      <br />
                      <br />• <strong>Confirmación:</strong> Un pedido se
                      considera colocado únicamente después de finalizar el
                      proceso de checkout y pago.
                    </>
                  ),
                },
                {
                  id: 4,
                  title: "4. Política de Envío",
                  content: (
                    <>
                      • <strong>GAM:</strong> Se aplicará un costo de envío fijo
                      de ₡1,800 + IVA, que se sumará al total de su orden.
                      <br />
                      <br />• <strong>Fuera de GAM:</strong> El envío se
                      realizará mediante "pago contra entrega" a través de
                      Correos de Costa Rica. El costo del envío no se incluirá
                      en el total y deberá ser cancelado al servicio de
                      mensajería.
                    </>
                  ),
                },
                {
                  id: 5,
                  title: "5. Propiedad Intelectual",
                  content:
                    "Todo el contenido presente en esta plataforma, incluyendo imágenes, textos, logos y diseño, es propiedad intelectual protegida. Queda prohibida su reproducción o uso no autorizado.",
                },
                {
                  id: 6,
                  title: "6. Modificaciones",
                  content:
                    "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación. Es su responsabilidad revisar periódicamente estos términos.",
                },
              ].map((section) => (
                <Accordion
                  key={section.id}
                  elevation={0}
                  defaultExpanded={section.defaultExpanded}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    borderRadius: "24px !important",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    "&:before": { display: "none" },
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&.Mui-expanded": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                      mb: 2,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon
                        sx={{ color: "#F72585", fontSize: "2rem" }}
                      />
                    }
                    sx={{ px: 4, py: 1 }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.2rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {section.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 4, pb: 4 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255, 255, 255, 0.9)",
                        lineHeight: 1.7,
                        fontSize: "1.05rem",
                      }}
                    >
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

export default TermsAndConditionsPage;
