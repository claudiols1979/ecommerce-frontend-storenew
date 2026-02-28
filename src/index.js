import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline"; // ¡Importa CssBaseline!
import theme from "./theme";
import { AuthProvider } from "./contexts/AuthContext";
import { OrderProvider } from "./contexts/OrderContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ReviewProvider } from "./contexts/ReviewContext";
import { DepartmentalProvider } from "./contexts/DepartmentalContext";
import { SearchProvider } from "./contexts/searchContext";
import { UpdateInfoProvider } from "./contexts/UpdateInfoContext";
import { HeroCarouselProvider } from "./contexts/HeroCarouselContext";
import { AdGridProvider } from "./contexts/AdGridContext";
import { HeroCarouselVideoProvider } from "./contexts/HeroCarouselVideoContext";
import { ConfigProvider } from "./contexts/ConfigContext";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* ¡Añade CssBaseline aquí! */}
      <Router>
        <HelmetProvider>
          <AuthProvider>
            <ConfigProvider>
              <ProductProvider>
                <OrderProvider>
                  <ReviewProvider>
                    <DepartmentalProvider>
                      <SearchProvider>
                        <UpdateInfoProvider>
                          <HeroCarouselProvider>
                            <AdGridProvider>
                              <HeroCarouselVideoProvider>
                                <App />
                              </HeroCarouselVideoProvider>
                            </AdGridProvider>
                          </HeroCarouselProvider>
                        </UpdateInfoProvider>
                      </SearchProvider>
                    </DepartmentalProvider>
                  </ReviewProvider>
                </OrderProvider>
              </ProductProvider>
            </ConfigProvider>
          </AuthProvider>
        </HelmetProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>,
);
