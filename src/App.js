import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Box, styled } from "@mui/material";

// Layout components
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";

// Page components
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NewPasswordPage from "./pages/NewPasswordPage";
import PrivacyPolicies from "./pages/PrivacyPolicies";
import TermsConditions from "./pages/TermsConditions";
import PaymentRedirectPage from "./pages/PaymentRedirectPage";
import DepartmentalFilterBar from "./layouts/DepartmentalFilterBar";

// PrivateRoute component
import PrivateRoute from "./components/auth/PrivateRoute";

// Styled components
const AppContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
});

const MainContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

// Layout para páginas que siempre tienen Header/Footer
const MainLayout = ({ children }) => (
  <AppContainer>
    <Header />
    <DepartmentalFilterBar />
    <MainContent>{children}</MainContent>
    <Footer />
  </AppContainer>
);

function App() {
  return (
    <Routes>
      {/* --- GRUPO 1: RUTAS PÚBLICAS SIN LAYOUT PRINCIPAL --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<NewPasswordPage />} />

      {/* --- AHORA LA RUTA DE PAGO ES UNA RUTA PRINCIPAL CON SU PROPIO LAYOUT --- */}
      <Route path="/payment-redirect" element={<PaymentRedirectPage />} />

      {/* --- GRUPO 2: RUTAS CON LAYOUT PRINCIPAL --- */}
      {/* Todas las rutas aquí tendrán Header y Footer */}
      <Route
        path="/*"
        element={
          <MainLayout>
            <Routes>
              {/* Rutas públicas dentro del layout principal */}
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/privacy" element={<PrivacyPolicies />} />
              <Route path="/conditions" element={<TermsConditions />} />
              {/* Rutas que requieren autenticación */}
              <Route element={<PrivateRoute />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Fallback para cualquier ruta desconocida dentro de este layout */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
