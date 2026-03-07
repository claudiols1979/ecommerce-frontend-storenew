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
import { useWishlist } from "../contexts/WishlistContext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

import useScrollDirection from "../hooks/useScrollDirection";

const Header = () => {
  const { setCurrentFilters, resetSearch, fetchDepartmentalProducts } = useDepartmental();
  const { gridItems } = useAdGrid();
  const { cartItems, addItemToCart } = useOrders();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isHiding, toggleForceShow } = useScrollDirection(15, true);
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { wishlist, toggleWishlist } = useWishlist();
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const [animate, setAnimate] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [wishlistQuantities, setWishlistQuantities] = useState({});

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

  const handleWishlistDrawerClose = () => {
    setWishlistDrawerOpen(false);
  };

  const handleWishlistDrawerToggle = () => {
    setWishlistDrawerOpen(!wishlistDrawerOpen);
  };

  const handleWishlistQuantityChange = (productId, change) => {
    setWishlistQuantities(prev => {
      const current = prev[productId] || 1;
      const newQuantity = Math.max(1, current + change);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleWishlistAddToCart = async (product) => {
    if (typeof addItemToCart !== "function" || !user) return;

    const qty = wishlistQuantities[product._id] || 1;
    let calculatedPrice = null;

    if (user.role === "Revendedor" && user.resellerCategory && product.resellerPrices) {
      const priceForCategory = product.resellerPrices[user.resellerCategory];
      if (typeof priceForCategory === "number" && priceForCategory > 0) {
        calculatedPrice = priceForCategory;
      }
    }

    if (calculatedPrice === null && product.resellerPrices && typeof product.resellerPrices.cat1 === "number" && product.resellerPrices.cat1 > 0) {
      calculatedPrice = product.resellerPrices.cat1;
    }

    const priceToPass = calculatedPrice || 0;
    if (priceToPass <= 0) return;

    try {
      await addItemToCart(product._id, qty, priceToPass);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (searchTerm.trim()) {
      // Forzar que el teclado del móvil se cierre
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

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
      <Box
        sx={{
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHiding
            ? (isMobile ? "translateY(-400px)" : "translateY(-70px)")
            : "translateY(0)",
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        {!isMobile && <PromotionalBanner />}
        <AppBar
          position="relative"
          onClick={isHiding ? toggleForceShow : undefined}
          sx={{
            width: "98%",
            mx: "auto",
            background:
              "linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(49, 0, 138, 0.85) 35%, rgba(168, 85, 247, 0.85) 65%, rgba(247, 37, 133, 0.85) 100%) !important",
            backgroundImage: `linear-gradient(to bottom, transparent, ${amber[0]})`,
            boxShadow: 0,
            borderRadius: 2,
            cursor: isHiding ? "pointer" : "default",
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
                    sx={{ mr: 1, color: "#fff" }}
                    aria-label={`wishlist with ${wishlist.length} items`}
                    onClick={handleWishlistDrawerToggle}
                  >
                    <Badge badgeContent={wishlist.length} color="error">
                      <FavoriteIcon />
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
                  <IconButton
                    color="#fff"
                    sx={{ ml: 1 }}
                    aria-label={`wishlist with ${wishlist.length} items`}
                    onClick={handleWishlistDrawerToggle}
                  >
                    <Badge badgeContent={wishlist.length} color="error">
                      <FavoriteIcon sx={{ color: "#fff" }} />
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
                    onTouchStart={(e) => {
                      // Prevenir que el teclado se cierre y desplace el layout antes del click
                      if (searchTerm.trim()) {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
                    onMouseDown={(e) => {
                      if (searchTerm.trim()) {
                        e.preventDefault();
                        handleSearch(e);
                      }
                    }}
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
      </Box>

      {/* --- DRAWER DE WISHLIST --- */}
      <Drawer
        anchor="right"
        open={wishlistDrawerOpen}
        onClose={handleWishlistDrawerClose}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 3,
          "& .MuiDrawer-paper": {
            width: { xs: '300px', sm: '350px' },
            backgroundColor: '#fff',
            p: 2,
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            px: 2,
            py: 2,
            background: 'linear-gradient(135deg, rgba(49, 0, 138, 0.85) 0%, rgba(49, 0, 138, 0.85) 35%, rgba(168, 85, 247, 0.85) 65%, rgba(247, 37, 133, 0.85) 100%) !important',
            margin: '-16px -16px 16px -16px', // Compensar el padding interno del Drawer
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.5px'
            }}
          >
            Lista de deseos
          </Typography>
          <IconButton
            onClick={handleWishlistDrawerClose}
            sx={{
              color: '#ffffff',
              backgroundColor: 'rgba(255,255,255,0.15)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
            }}
          >
            <CloseIcon fontSize="small" sx={{ color: '#ffffff' }} />
          </IconButton>
        </Box>

        {wishlist.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <FavoriteIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">Tu lista de deseos está vacía.</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {wishlist.map((item) => (
              <React.Fragment key={item._id}>
                <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                  <Box
                    component="img"
                    src={item.imageUrls?.[0]?.secure_url || "https://placehold.co/60x60/E0E0E0/FFFFFF?text=No+Image"}
                    sx={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 1, mr: 2, cursor: 'pointer', border: '1px solid #eee' }}
                    onClick={() => {
                      navigate(`/products/${item._id}`);
                      handleWishlistDrawerClose();
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => {
                        navigate(`/products/${item._id}`);
                        handleWishlistDrawerClose();
                      }}>
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'bold', display: 'block' }}>
                          {item.brand}
                        </Typography>

                        {/* QUANTITY SELECTOR AND ACTION BUTTONS */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                          {/* Quantities */}
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #e0e0e0',
                            borderRadius: '20px',
                            px: 0.5,
                            py: 0.2,
                            width: 'fit-content'
                          }}>
                            <IconButton
                              size="small"
                              onClick={() => handleWishlistQuantityChange(item._id, -1)}
                              disabled={(wishlistQuantities[item._id] || 1) <= 1}
                              sx={{ p: 0.5, color: 'text.secondary' }}
                            >
                              <RemoveCircleOutlineIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2" sx={{ mx: 0.5, minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                              {wishlistQuantities[item._id] || 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleWishlistQuantityChange(item._id, 1)}
                              sx={{ p: 0.5, color: 'primary.main' }}
                            >
                              <AddCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* Add to cart / Remove / Detail */}
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={!user || item.countInStock <= 0}
                              onClick={() => handleWishlistAddToCart(item)}
                              startIcon={<AddShoppingCartIcon sx={{ fontSize: '1rem !important' }} />}
                              sx={{
                                fontSize: '0.7rem',
                                py: 0.6,
                                px: 1.5,
                                flex: 2,
                                textTransform: 'none',
                                borderRadius: '25px',
                                background: 'linear-gradient(90deg, #A855F7 0%, #F72585 100%) !important',
                                boxShadow: "0 4px 10px rgba(168, 85, 247, 0.3)",
                                "&:hover": {
                                  boxShadow: "0 6px 15px rgba(247, 37, 133, 0.4)",
                                  transform: "translateY(-1px)"
                                },
                                transition: "all 0.2s ease-in-out"
                              }}
                            >
                              Agregar
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.65rem',
                                py: 0.5,
                                flex: 1,
                                borderRadius: '20px',
                                borderColor: 'text.disabled',
                                color: 'text.secondary',
                                "&:hover": {
                                  borderColor: 'primary.main',
                                  color: 'primary.main',
                                  backgroundColor: 'rgba(168, 85, 247, 0.05)'
                                }
                              }}
                              onClick={() => {
                                navigate(`/products/${item._id}`);
                                handleWishlistDrawerClose();
                              }}
                            >
                              Ver
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => toggleWishlist(item)}
                              sx={{
                                p: 0.5,
                                border: '1px solid',
                                borderColor: 'error.light',
                                borderRadius: '50%',
                                "&:hover": {
                                  backgroundColor: 'error.lighter'
                                }
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Drawer>
    </Fragment>
  );
};

export default Header;
