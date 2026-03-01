import React, { Fragment, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputBase,
  Paper,
  alpha,
  Menu,
  MenuItem,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useOrders } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import { useDepartmental } from "../contexts/DepartmentalContext";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NavBranding from "../components/common/NavBranding";
import { amber } from "@mui/material/colors";
import PromotionalBanner from "../components/common/PromotionBanner";
import { useAdGrid } from "../contexts/AdGridContext";
import "./components/CartAnimation.css"; // new

const Header = () => {
  const { setCurrentFilters, resetSearch, fetchDepartmentalProducts } = useDepartmental();
  const { gridItems } = useAdGrid();
  const { cartItems } = useOrders();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const [animate, setAnimate] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    // Solo animar cuando el contador aumenta
    if (cartItemCount > prevCount && cartItemCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartItemCount);
  }, [cartItemCount, prevCount]);

  const handleLogout = () => {
    logout();
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMenuNavigate = (path) => {
    navigate(path);
    handleMobileMenuClose();
    handleProfileMenuClose();
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCurrentFilters({});
      resetSearch();
      // Si ya estamos en /products, forzar recarga con replace
      if (location.pathname === "/products") {
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`, {
          replace: true,
        });
      } else {
        // Si estamos en otra página, navegar normalmente
        navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      }
      setSearchTerm("");
      setSearchOpen(false);
    }
  };

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (searchOpen) {
      setSearchTerm("");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleDepartmentClick = (department) => {
    navigate("/products");
    setTimeout(() => {
      fetchDepartmentalProducts({ department: department }, 1, 20);
    }, 100);
  };

  // --- FUNCIÓN DE ESTILO PARA LOS BOTONES DEL MENÚ ---
  const getNavButtonStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      mx: 1,
      fontWeight: isActive ? 900 : 600,
      color: "#Fff",
      borderBottom: isActive ? `3px solid #fff` : "3px solid transparent",
      borderRadius: 0,
      paddingBottom: "4px",
      transition: "border-bottom 0.2s ease-in-out",
      "&:hover": {
        borderBottom: `3px solid #fff`,
      },
    };
  };

  // --- FUNCIÓN DE ESTILO PARA LOS ITEMS DEL MENÚ MÓVIL ---
  const getMobileNavStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      fontWeight: 700,
      backgroundColor: isActive ? theme.palette.action.selected : "transparent",
      borderRadius: "8px",
      "& .MuiListItemText-primary": {
        fontWeight: isActive ? "bold" : "normal",
      },
    };
  };

  const drawerContent = (
    <Box
      sx={{
        width: 225,
        height: "100%",
        p: 1,
        background:
          "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(49, 0, 138, 0.85) 35%, rgba(168, 85, 247, 0.85) 65%, rgba(247, 37, 133, 0.85) 100%) !important",
      }}
      role="presentation"
      onClick={handleMobileMenuClose}
      onKeyDown={handleMobileMenuClose}
    >
      <Typography variant="h6" sx={{ mb: 6 }}></Typography>
      <Divider />
      <List>
        <ListItem
          button
          onClick={() => handleMenuNavigate("/")}
          sx={getMobileNavStyle("/")}
        >
          <ListItemText primary="Inicio" sx={{ mr: 1, color: "#fff" }} />
        </ListItem>
        <ListItem
          button
          onClick={() => handleMenuNavigate("/products")}
          sx={getMobileNavStyle("/products")}
        >
          <ListItemText primary="Productos" sx={{ mr: 1, color: "#fff" }} />
        </ListItem>
        <ListItem
          button
          onClick={() => handleMenuNavigate("/contact")}
          sx={getMobileNavStyle("/contact")}
        >
          <ListItemText primary="Contacto" sx={{ mr: 1, color: "#fff" }} />
        </ListItem>
        <ListItem
          button
          onClick={() => handleMenuNavigate("/privacy")}
          sx={getMobileNavStyle("/privacy")}
        >
          <ListItemText primary="Política de Privacidad" sx={{ mr: 1, color: "#fff" }} />
        </ListItem>
        <ListItem
          button
          onClick={() => handleMenuNavigate("/conditions")}
          sx={getMobileNavStyle("/conditions")}
        >
          <ListItemText primary="Términos y Condiciones" sx={{ mr: 1, color: "#fff" }} />
        </ListItem>

        {user ? (
          <>
            <ListItem
              button
              onClick={() => handleMenuNavigate("/profile")}
              sx={getMobileNavStyle("/profile")}
            >
              <ListItemText primary="Mi cuenta" sx={{ mr: 1, color: "#fff" }} />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                handleLogout();
                handleMobileMenuClose();
              }}
            >
              <ExitToAppIcon sx={{ mr: 1, color: "#fff" }} />
              <ListItemText
                primary="Cerrar Sesión"
                sx={{ mr: 1, color: "#fff" }}
              />
            </ListItem>
          </>
        ) : (
          <ListItem
            button
            onClick={() => handleMenuNavigate("/login")}
            sx={getMobileNavStyle("/login")}
          >
            <ListItemText primary="Iniciar Sesión" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Fragment>
      <PromotionalBanner />
      <AppBar
        position="sticky"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: "98%",
          mx: "auto",
          //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          background:
            "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(49, 0, 138, 0.85) 35%, rgba(168, 85, 247, 0.85) 65%, rgba(247, 37, 133, 0.85) 100%) !important",
          //backgroundColor: 'rgba(38, 60, 92, 0.9)',
          backgroundImage: `linear-gradient(to bottom, transparent, ${amber[0]})`,
          boxShadow: 0,
          borderRadius: 2,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            flexWrap: "wrap",
            py: { xs: 1, sm: 0 },
            flexDirection: { xs: "row", lg: "row" },
            alignItems: "center",
          }}
        >
          {/* Primera fila: Branding y menú */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              order: 1,
            }}
          >
            <NavBranding />

            {isMobile ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {user && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      mr: 1,
                      display: { xs: "block", sm: "block" },
                    }}
                  >
                    Hola, {user.firstName || "Usuario"}
                  </Typography>
                )}
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  color="inherit"
                  sx={{ mr: 1, color: "#fff" }}
                  aria-label={`cart with ${cartItemCount} items`}
                  className={animate ? "cart-pulse" : ""}
                >
                  <Badge
                    badgeContent={cartItemCount}
                    color="success"
                    componentsProps={{
                      badge: {
                        className: animate ? "badge-bounce" : "",
                      },
                    }}
                  >
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleMobileMenuToggle}
                >
                  <MenuIcon sx={{ color: "#fff" }} />
                </IconButton>
                <Drawer
                  anchor="right"
                  open={mobileMenuOpen}
                  onClose={handleMobileMenuClose}
                  ModalProps={{
                    BackdropProps: {
                      sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(2px)",
                      },
                    },
                  }}
                  sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 2,
                    "& .MuiDrawer-paper": {
                      backgroundColor: "rgba(236, 59, 230, 0.92)",
                      backdropFilter: "blur(14px)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                      width: 230,
                      top: "70px",
                      height: "calc(100% - 100px)",
                      borderTopLeftRadius: "16px",
                      borderBottomLeftRadius: "18px",
                      border: "0.5px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      "& .MuiListItemText-primary": {
                        color: "white",
                        fontWeight: 400,
                      },
                      "& .MuiDivider-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      },
                    },
                  }}
                >
                  {drawerContent}
                </Drawer>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/"
                  sx={getNavButtonStyle("/")}
                >
                  Inicio
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/products"
                  sx={getNavButtonStyle("/products")}
                >
                  Productos
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/contact"
                  sx={getNavButtonStyle("/contact")}
                >
                  Contacto
                </Button>
                {user ? (
                  <>
                    <Button
                      color="inherit"
                      onClick={handleProfileMenuOpen}
                      sx={{
                        ...getNavButtonStyle("/profile"),
                        textTransform: "none",
                        display: "flex",
                        alignItems: "center",
                      }}
                      endIcon={<KeyboardArrowDownIcon />}
                    >
                      Hola, {user.firstName || "Usuario"}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleProfileMenuClose}
                      PaperProps={{
                        sx: {
                          mt: 1.5,
                          backgroundColor: "rgba(49, 0, 138, 0.95)",
                          backdropFilter: "blur(10px)",
                          color: "white",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          minWidth: 180,
                          "& .MuiMenuItem-root": {
                            fontSize: "0.9rem",
                            py: 1.5,
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: "right", vertical: "top" }}
                      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                      <MenuItem onClick={() => handleMenuNavigate("/profile")}>
                        Mi perfil / Órdenes
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuNavigate("/privacy")}>
                        Política de Privacidad
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuNavigate("/conditions")}>
                        Términos y Condiciones
                      </MenuItem>
                      <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
                      <MenuItem
                        onClick={() => {
                          handleLogout();
                          handleProfileMenuClose();
                        }}
                      >
                        <ExitToAppIcon sx={{ fontSize: 20, mr: 1 }} />
                        Cerrar Sesión
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    color="#fff"
                    component={RouterLink}
                    to="/login"
                    sx={getNavButtonStyle("/login")}
                  >
                    Iniciar Sesión
                  </Button>
                )}
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  color="#fff"
                  sx={{ ml: 2 }}
                  aria-label={`cart with ${cartItemCount} items`}
                  className={animate ? "cart-pulse" : ""}
                >
                  <Badge
                    badgeContent={cartItemCount}
                    color="success"
                    componentsProps={{
                      badge: {
                        className: animate ? "badge-bounce" : "",
                      },
                    }}
                  >
                    <ShoppingCartIcon sx={{ color: "#fff" }} />
                  </Badge>
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Search Box - Posición diferente según el dispositivo */}
          {isDesktop ? (
            /* Desktop: Search box en línea con el resto */
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                order: 3,
                mt: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  mb: 1,
                }}
              >
                <Paper
                  component="form"
                  onSubmit={handleSearch}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    backgroundColor: alpha(theme.palette.common.white, 0.15),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.common.white, 0.25),
                    },
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <InputBase
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      ml: 2,
                      flex: 1,
                      color: "white",
                      "&::placeholder": {
                        color: alpha(theme.palette.common.white, 0.7),
                      },
                    }}
                    inputProps={{ "aria-label": "buscar productos" }}
                  />
                  {searchTerm && (
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ color: "white" }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    type="submit"
                    sx={{
                      p: 1,
                      color: "white",
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.common.white, 0.3),
                      },
                    }}
                    aria-label="buscar"
                  >
                    <SearchIcon />
                  </IconButton>
                </Paper>
              </Box>

              {/* Información de envío debajo de la barra de búsqueda */}
              {user && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    fontSize: "0.75rem",
                    opacity: 0.9,
                    pl: 1,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Enviando a: {user.provincia || "Provincia"}, {user.canton || "Cantón"},{" "}
                    {user.distrito || "Distrito"}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            /* Mobile y Tablets: Search box full width debajo */
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
                order: 3,
                mt: 1,
                mb: 2,
                px: { xs: 0, sm: 0 },
              }}
            >
              <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  backgroundColor: alpha(theme.palette.common.white, 0.15),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.25),
                  },
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <InputBase
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    ml: 2,
                    flex: 1,
                    color: "white",
                    "&::placeholder": {
                      color: alpha(theme.palette.common.white, 0.7),
                    },
                  }}
                  inputProps={{ "aria-label": "buscar productos" }}
                />
                {searchTerm && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ color: "white" }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton
                  type="submit"
                  sx={{
                    p: 1,
                    color: "white",
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.common.white, 0.3),
                    },
                  }}
                  aria-label="buscar"
                >
                  <SearchIcon />
                </IconButton>
              </Paper>

              {/* Información de envío debajo de la barra de búsqueda en móvil */}
              {user && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    fontSize: "0.7rem",
                    opacity: 0.9,
                    mt: 1,
                    pl: 1,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1 }}>
                    Enviando a: {user.provincia || "Provincia"}, {user.canton || "Cantón"},{" "}
                    {user.distrito || "Distrito"}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Submenú de Departamentos - Solo Desktop */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              order: 4,
              pb: 2,
              gap: { md: 2, lg: 4 },
              flexWrap: "wrap",
            }}
          >
            {gridItems.slice(0, 6).map((item, index) => (
              <Button
                key={item._id || index}
                onClick={() => handleDepartmentClick(item.department)}
                sx={{
                  color: "white",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  textTransform: "none",
                  minWidth: "auto",
                  padding: "4px 8px",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    textDecoration: "underline",
                  },
                }}
              >
                {item.title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Fragment>
  );
};

export default Header;
