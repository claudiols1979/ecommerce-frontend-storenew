import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button, TextField, CircularProgress, Grid,
  Card, CardContent, Link as MuiLink, Tabs, Tab, useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthBranding from '../components/common/AuthBranding';

// Iconos para los campos de texto
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const LoginPage = () => {
  const [resellerCode, setResellerCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const WHATSAPP_AGENT_NUMBER = '50672317420';
  const whatsappMessage = "Hola, Soy nuevo usuario y quisiera obtener un codigo para ingresar a la tienda en linea.";
  const whatsappUrl = `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const success = await login(resellerCode);
    if (!success) {
      setResellerCode('');
    }
    setLoading(false);
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    await loginWithEmail(email, password);
    setLoading(false);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (user) {
    return null;
  }

  // Updated styles — vibrant gradient + glassmorphism
  const primaryButtonStyle = {
    p: 1.5,
    mb: 2,
    mt: 2,
    fontWeight: 'bold',
    fontSize: '1rem',
    borderRadius: '12px',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #c471ed 100%)',
    boxShadow: '0 4px 20px 0 rgba(118, 75, 162, 0.4)',
    transition: 'all 0.3s ease',
    textTransform: 'none',
    letterSpacing: '0.5px',
    '&:hover': {
      background: 'linear-gradient(135deg, #764ba2 0%, #c471ed 50%, #f64f59 100%)',
      boxShadow: '0 6px 30px 0 rgba(118, 75, 162, 0.6)',
      transform: 'translateY(-2px)',
    },
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(4px)',
      color: '#fff',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.6)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.8)',
      },
      '& input::placeholder': {
        color: 'rgba(255, 255, 255, 0.5)',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#ffffff',
    },
    '& .MuiInputBase-input': {
      color: '#fff',
    },
  };

  const tabStyle = {
    '& .MuiTab-root': {
      color: 'rgba(255, 255, 255, 0.6)',
      fontWeight: 600
    },
    '& .Mui-selected': {
      color: '#ffffff'
    },
    '& .MuiTabs-indicator': {
      backgroundColor: '#ffffff'
    }
  };

  const iconColor = 'rgba(255, 255, 255, 0.75)';

  // Animated floating orb keyframes
  const floatingOrb1 = {
    '@keyframes floatOrb1': {
      '0%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
      '33%': { transform: 'translate(60px, -80px) scale(1.2) rotate(120deg)' },
      '66%': { transform: 'translate(-40px, 40px) scale(0.8) rotate(240deg)' },
      '100%': { transform: 'translate(0, 0) scale(1) rotate(360deg)' },
    },
  };

  const floatingOrb2 = {
    '@keyframes floatOrb2': {
      '0%': { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
      '33%': { transform: 'translate(-60px, 60px) scale(1.3) rotate(-120deg)' },
      '66%': { transform: 'translate(50px, -50px) scale(0.7) rotate(-240deg)' },
      '100%': { transform: 'translate(0, 0) scale(1) rotate(-360deg)' },
    },
  };

  const floatingOrb3 = {
    '@keyframes floatOrb3': {
      '0%': { transform: 'translate(0, 0) scale(1)' },
      '50%': { transform: 'translate(40px, 60px) scale(1.15)' },
      '100%': { transform: 'translate(0, 0) scale(1)' },
    },
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      background: `
        radial-gradient(ellipse 80% 60% at 20% 80%, rgba(200, 50, 180, 0.9) 0%, transparent 55%),
        radial-gradient(ellipse 70% 80% at 75% 20%, rgba(90, 50, 220, 0.85) 0%, transparent 50%),
        radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 120, 200, 0.6) 0%, transparent 50%),
        radial-gradient(ellipse 50% 70% at 30% 30%, rgba(100, 100, 255, 0.7) 0%, transparent 45%),
        radial-gradient(ellipse 90% 50% at 80% 70%, rgba(220, 60, 150, 0.8) 0%, transparent 50%),
        radial-gradient(ellipse 40% 40% at 60% 40%, rgba(255, 200, 255, 0.5) 0%, transparent 40%),
        linear-gradient(135deg, #3a0663 0%, #5b1a8a 30%, #7b2fbe 60%, #4a1080 100%)
      `,
      py: { xs: 4, md: 8 },
      px: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      ...floatingOrb1,
      ...floatingOrb2,
      ...floatingOrb3,
      // Large magenta swirl blob - top right
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '700px',
        height: '700px',
        borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
        background: 'radial-gradient(ellipse at center, rgba(220, 40, 160, 0.7) 0%, rgba(180, 30, 200, 0.4) 40%, transparent 70%)',
        top: '-200px',
        right: '-150px',
        animation: 'floatOrb1 12s ease-in-out infinite',
        pointerEvents: 'none',
        filter: 'blur(30px)',
      },
      // Cool blue-purple swirl blob - bottom left
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%',
        background: 'radial-gradient(ellipse at center, rgba(80, 60, 230, 0.7) 0%, rgba(120, 80, 255, 0.4) 40%, transparent 70%)',
        bottom: '-150px',
        left: '-120px',
        animation: 'floatOrb2 14s ease-in-out infinite',
        pointerEvents: 'none',
        filter: 'blur(25px)',
      },
    }}>
      {/* Extra decorative blobs */}
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50% 40% 60% 40% / 60% 30% 70% 40%',
          background: 'radial-gradient(ellipse at center, rgba(255, 150, 220, 0.5) 0%, rgba(255, 100, 180, 0.2) 50%, transparent 70%)',
          top: '30%',
          left: '10%',
          animation: 'floatOrb3 10s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '30% 70% 50% 50% / 50% 40% 60% 50%',
          background: 'radial-gradient(ellipse at center, rgba(255, 220, 255, 0.45) 0%, rgba(200, 150, 255, 0.15) 50%, transparent 70%)',
          top: '10%',
          left: '40%',
          animation: 'floatOrb2 16s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(35px)',
          zIndex: 0,
        }}
      />
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Card sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            transform: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          },
        }}>
          <CardContent>
            <AuthBranding lightMode={true} />

            <Box sx={{
              borderBottom: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              mb: 3
            }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                centered
                textColor="inherit"
                sx={tabStyle}
              >
                <Tab label="Con Correo" />
                <Tab label="Con Código" />
              </Tabs>
            </Box>

            {tab === 0 && (
              <Box component="form" onSubmit={handleEmailSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Correo Electrónico"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: iconColor }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{ color: iconColor }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <MuiLink
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    mt: 1,
                    mb: 2,
                    color: 'rgba(255, 255, 255, 0.6)',
                    '&:hover': { color: '#ffffff' }
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </MuiLink>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={primaryButtonStyle}
                  disabled={loading || !email || !password}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Iniciar Sesión'}
                </Button>
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  ¿No tienes cuenta?{' '}
                  <MuiLink
                    component={RouterLink}
                    to="/register"
                    underline="hover"
                    sx={{ fontWeight: 'bold', color: '#ffffff', '&:hover': { color: 'rgba(255, 255, 255, 0.9)' } }}
                  >
                    Regístrate aquí
                  </MuiLink>
                </Typography>
              </Box>
            )}

            {tab === 1 && (
              <Box component="form" onSubmit={handleCodeSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="resellerCode"
                  label="Código de acceso"
                  name="resellerCode"
                  autoComplete="off"
                  autoFocus
                  value={resellerCode}
                  onChange={(e) => setResellerCode(e.target.value)}
                  variant="outlined"
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: <VpnKeyOutlinedIcon sx={{ mr: 1, color: iconColor }} />
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={primaryButtonStyle}
                  disabled={loading || !resellerCode}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Ingresar con Código'}
                </Button>
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ mt: 3, color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  ¿Necesitas un código?{' '}
                  <MuiLink
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ fontWeight: 'bold', color: '#ffffff', '&:hover': { color: 'rgba(255, 255, 255, 0.9)' } }}
                  >
                    Contacta a tu administrador.
                  </MuiLink>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;