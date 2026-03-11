import React from "react";
import { Box, useTheme } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const NavBranding = () => {
  const theme = useTheme();

  return (
    <RouterLink to="/" style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          position: "relative",
          "&:hover": {
            "& .brand-letter": {
              transform: "rotate(-20deg) scale(1.1)",
            },
            "& .brand-tagline": {
              transform: "translateX(5px)",
            },
          },
        }}
      >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "6px 16px 6px 12px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: "2rem",
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                ORIYINA
              </Box>

              <Box
                className="brand-letter"
                sx={{
                  fontSize: "2.5rem",
                  lineHeight: 1,
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 800,
                  color: "#fff",
                  transform: "rotate(0deg)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "inline-block",
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  mr: 1,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "4px",
                    left: 0,
                    width: "100%",
                    height: "2px",
                    background:
                      "linear-gradient(90deg, transparent, #fff, transparent)",
                    opacity: 0.5,
                    transform: "scaleX(0)",
                    transition: "transform 0.3s ease",
                  },
                  "&:hover::after": {
                    transform: "scaleX(1)",
                  },
                }}
              >
                ⅃
              </Box>
            </Box>

            {/* Tagline moderno */}
            <Box
              className="brand-tagline"
              sx={{
                mt: -0.5, // Ajuste para que quede más cerca del logo
                ml: 0.5, // Reduced shift as requested for precise centering
                opacity: 0.8,
                transform: "translateX(0)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "block",
              }}
            >
              <Box
                component="span"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: "0.75rem", md: "0.875rem" },
                  fontWeight: 300,
                  color: "#fff",
                  letterSpacing: "0.02em",
                  opacity: 0.7,
                }}
              >
                Original como vos!
              </Box>
            </Box>
          </Box>
      </Box>
    </RouterLink>
  );
};

export default NavBranding;