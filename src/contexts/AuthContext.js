import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API_URL from "../config";
import authService from "../services/authService";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage on init:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const navigate = useNavigate();

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (user && user.token) {
      instance.defaults.headers.common["Authorization"] =
        `Bearer ${user.token}`;
    } else {
      delete instance.defaults.headers.common["Authorization"];
    }

    // --- INTERCEPTOR CORREGIDO ---
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // La lógica de forzar el cierre de sesión SOLO debe ejecutarse si
        // había un usuario logueado en primer lugar.
        if (user && error.response && error.response.status === 401) {
          console.error(
            "Token inválido o expirado para el usuario logueado. Forzando cierre de sesión.",
          );
          logout();
        }
        // Si no hay un usuario, simplemente se rechaza la promesa
        // para que el componente que hizo la llamada maneje el error, sin forzar un logout global.
        return Promise.reject(error);
      },
    );

    return instance;
  }, [user, logout]);

  useEffect(() => {
    if (user && user.token) {
      try {
        const decodedToken = jwtDecode(user.token);
        if (decodedToken.exp * 1000 < Date.now()) {
          console.warn(
            "Cliente: JWT detectado como expirado. Forzando cierre de sesión.",
          );
          logout();
        }
      } catch (decodeError) {
        console.error(
          "Error al decodificar JWT o formato de token inválido:",
          decodeError,
        );
        logout();
      }
    }
  }, [user, logout]);

  // Tu función login original (con código)
  const login = async (resellerCode) => {
    try {
      const userData = await authService.loginReseller(resellerCode);
      setUser(userData);
      return true;
    } catch (error) {
      console.error(
        "Login de revendedor fallido:",
        error.response?.data?.message || error.message,
      );
      return false;
    }
  };

  // El resto de tus funciones (loginWithEmail, register, etc.) permanecen exactamente iguales
  const loginWithEmail = useCallback(
    async (email, password) => {
      try {
        const userData = await authService.login({ email, password });
        setUser(userData);
        navigate("/");
        return { success: true };
      } catch (error) {
        const message =
          error.response?.data?.message || "Credenciales inválidas.";
        return { success: false, message };
      }
    },
    [navigate],
  );

  const register = useCallback(
    async (userData) => {
      try {
        const data = await authService.register(userData);
        setUser(data);
        navigate("/login");
        return { success: true };
      } catch (error) {
        const message =
          error.response?.data?.message || "Error durante el registro.";
        return { success: false, message };
      }
    },
    [navigate],
  );

  const forgotPassword = useCallback(async (email) => {
    try {
      const data = await authService.forgotPassword({ email });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al enviar el correo.",
      };
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      const data = await authService.resetPassword(token, { newPassword });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al restablecer la contraseña.",
      };
    }
  }, []);

  // Agrega esta función para actualizar el usuario
  const updateUser = useCallback((updatedUserData) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      const updatedUser = {
        ...prevUser,
        ...updatedUserData,
        // Mantén el token intacto
        token: prevUser.token,
      };

      // Actualiza también localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user && user.token) {
      try {
        const freshData = await authService.getMe(user.token);
        updateUser(freshData);
      } catch (error) {
        console.error("Failed to refresh user profile:", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    }
  }, [user, updateUser, logout]);

  // Refrescar perfil al montar la app si ya hay sesión
  useEffect(() => {
    if (user && user.token) {
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  const value = {
    user,
    api,
    login,
    logout,
    API_URL,
    isAuthenticated: !!user,
    register,
    loginWithEmail,
    forgotPassword,
    resetPassword,
    updateUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
