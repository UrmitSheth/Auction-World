import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import axios from "axios";
import { createBrowserRouter, RouterProvider } from "react-router";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import { protectedRoutes } from "./routers/protectedRoutes.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { openRoutes } from "./routers/openRoutes.jsx";
import InitAuth from "./init/InitAuth.jsx";
import { adminRouter } from "./routers/adminRouter.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

// Bypass Localtunnel landing page for API calls
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

const queryClient = new QueryClient();
const router = createBrowserRouter([...adminRouter,...protectedRoutes, ...openRoutes]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <InitAuth>
                <SocketContextProvider>
                  <RouterProvider router={router} />
                </SocketContextProvider>
              </InitAuth>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
