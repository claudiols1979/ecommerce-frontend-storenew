import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Asegúrate de la ruta correcta

const PrivateRoute = () => {
  const { user, isAuthenticated } = useAuth(); // Obtén el objeto user y el booleano isAuthenticated

  console.log("isAuthenticated:", isAuthenticated);

  // Si el usuario no está autenticado, redirige a la página de login.
  // isAuthenticated es una propiedad de conveniencia que añadimos en AuthContext.js
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // 'replace' evita añadir la ruta actual al historial
  }

  // Si el usuario está autenticado, renderiza las rutas anidadas (el componente de página protegido)
  return <Outlet />;
};

export default PrivateRoute;
