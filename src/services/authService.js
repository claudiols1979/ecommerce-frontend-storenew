// frontend/src/services/authService.js

import axios from 'axios';
import API_URL from '../config'; // Asegúrate de que esta ruta sea correcta para tu config.js

const API_AUTH_URL = `${API_URL}/api/auth`; // Base URL para las rutas de autenticación

// --- Registro de Revendedor con Contraseña ---
const register = async (userData) => {
  // Llama al nuevo endpoint de registro para la tienda
  const response = await axios.post(`${API_URL}/api/auth/store/register`, userData);
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// --- Inicio de Sesión con Email y Contraseña ---
const login = async (credentials) => {
  // Llama al nuevo endpoint de login para la tienda
  const response = await axios.post(`${API_URL}/api/auth/store/login`, credentials);
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Función para el login de revendedor (solo con resellerCode)
const loginReseller = async (resellerCode) => {
  const response = await axios.post(`${API_AUTH_URL}/reseller-login`, { resellerCode });

  // Si el login es exitoso y se recibe un token, guarda el OBJETO DE USUARIO COMPLETO
  // tal como lo devuelve el backend (que incluye el token)
  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data; // Devuelve los datos de la respuesta (incluyendo el token)
};

// Función para cerrar sesión
const logout = () => {
  localStorage.removeItem("user"); // Elimina el objeto de usuario completo

  // Remove all attributeOptions from localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('attributeOptions')) {
      keysToRemove.push(key);
    }
  }

  // Remove all found attributeOptions keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('User logged out and all attributeOptions removed');
};

// --- Funciones de Reseteo de Contraseña (reutilizadas) ---
const forgotPassword = async (emailData) => {
  const response = await axios.post(`${API_URL}/api/auth/forgot-password-store`, emailData);
  return response.data;
};

const resetPassword = async (token, passwordData) => {
  const response = await axios.put(`${API_URL}/api/auth/reset-password/${token}`, passwordData);
  return response.data;
};

const getMe = async (token) => {
  const response = await axios.get(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

const authService = {
  register,
  login, // with username and password
  loginReseller, // with resellerCode
  logout,
  forgotPassword,
  resetPassword,
  getMe
};



export default authService;