import './styles/ios-fixes.css';
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "./global.css";
import { AuthModalProvider } from "./context/AuthModalContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SiteProvider } from "./context/SiteContext"

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const container = document.getElementById("root");
const root = createRoot(container);


root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <React.StrictMode>
        <BrowserRouter>
          <SiteProvider>
            <AuthModalProvider>
              <App />
            </AuthModalProvider>
          </SiteProvider>
        </BrowserRouter>
      </React.StrictMode>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </GoogleOAuthProvider >
);

reportWebVitals();
