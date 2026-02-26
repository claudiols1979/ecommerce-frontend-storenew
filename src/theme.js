import { createTheme } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: {
      main: "#212121", // Gris oscuro para el color principal de la marca
    },
    secondary: {
      main: "#FFC107", // Ámbar para acentos
    },
    info: {
      main: "#03A9F4",
    },
    success: {
      main: "#4CAF50",
    },
    error: {
      main: "#F44336",
    },
    warning: {
      main: "#FF9800",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
    background: {
      default: "#FFFFFF", // CAMBIO CLAVE: Fondo 100% blanco puro para toda la página
      paper: "#FFFFFF", // Blanco puro para tarjetas y superficies elevadas (ahora igual que default)
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      "@media (min-width:600px)": { fontSize: "3rem" },
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      "@media (min-width:600px)": { fontSize: "2.5rem" },
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      "@media (min-width:600px)": { fontSize: "2rem" },
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      "@media (min-width:600px)": { fontSize: "1.75rem" },
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      "@media (min-width:600px)": { fontSize: "1.5rem" },
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      "@media (min-width:600px)": { fontSize: "1.1rem" },
    },
    body1: { fontSize: "1rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5 },
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          padding: "10px 20px",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
          },
        },
        containedPrimary: {
          color: "#ffffff",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          // La sombra es crucial para que las tarjetas "floten" en un fondo blanco
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Fondo semi-transparente del Header (se verá blanco con blur)
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          color: "#212121",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          textDecoration: "none",
          color: "inherit",
          "&:hover": {
            textDecoration: "underline",
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
