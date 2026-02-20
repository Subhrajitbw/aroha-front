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

const container = document.getElementById("root");
const root = createRoot(container);


root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <React.StrictMode>
      <BrowserRouter>
        <SiteProvider>
          <AuthModalProvider>
            <App />
          </AuthModalProvider>
        </SiteProvider>
      </BrowserRouter>
    </React.StrictMode>
  </GoogleOAuthProvider >
);

reportWebVitals();
