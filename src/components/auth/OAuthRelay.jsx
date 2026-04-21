import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { sdk } from "../../lib/medusaClient";

/**
 * OAuthRelay
 * Finalizes the Maison Handshake. 
 * Bridges Google Identities with Customer Profiles.
 */
const OAuthRelay = () => {
  const navigate = useNavigate();
  const { getCurrentUser } = useAuthStore();
  const hasRun = useRef(false);
  const [status, setStatus] = useState("Synchronizing Maison...");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const finalizeAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const error = params.get("error");

        if (error) throw new Error(error);
        if (!code) throw new Error("Missing protocol code");

        setStatus("Verifying Identity...");

        // 🟢 STEP 1: Exchange Code for Medusa Session
        const result = await sdk.auth.callback("customer", "google", {
          code,
          state,
        });

        const token = typeof result === "string" ? result : result?.token;
        if (!token) throw new Error("Handshake failed");

        // Force token persistence
        sdk.client.setToken(token);
        localStorage.setItem("medusa_auth_token", token);

        setStatus("Aligning Collection...");

        // 🔵 STEP 2 & 3: Profile Check & Refinement
        let userResult = await getCurrentUser();
        
        // Decoding the most up-to-date info from Google
        const payload = JSON.parse(atob(token.split(".")[1]));
        const metadata = payload.user_metadata || {};
        const email = payload.email || metadata.email || payload.sub;

        // Smart Name Detection
        let firstName = payload.given_name || metadata.given_name || "";
        let lastName = payload.family_name || metadata.family_name || "";
        if (!firstName && (payload.name || metadata.name)) {
          const parts = (payload.name || metadata.name).split(" ");
          firstName = parts[0];
          lastName = parts.slice(1).join(" ") || "Guest";
        }

        // Case A & C: Missing entirely OR "Ghost" Profile (404 Orphan)
        if (!userResult.success) {
          setStatus("Provisioning Maison Profile...");
          
          try {
            const { customer: newCustomer } = await sdk.store.customer.create(
              {
                email: email,
                first_name: firstName || "Maison",
                last_name: lastName || "Guest",
              },
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("[OAuthRelay] Provisioning Success. Hydrating session...");
            
            // 🔥 INSTANT HYDRATION: Manually sync the store state 
            // This bypasses the 401 issue by using the data we just received
            useAuthStore.setState({
              user: newCustomer,
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false
            });

            userResult = { success: true, user: newCustomer };
          } catch (createErr) {
            console.error("[OAuthRelay] Provisioning Blocked:", createErr.response?.data || createErr.message);
            setStatus("Link Required");
            throw new Error("Social account link conflict. Please clear database or use another account.");
          }
        } 

        if (!userResult.success) {
           throw new Error("Handshake complete but profile link failed. Please refresh.");
        }
        
        // Case B: Profile exists but name is placeholder -> Refine
        else if (userResult.success && (userResult.user?.first_name === "Maison" || !userResult.user?.first_name)) {
          if (firstName && firstName !== "Maison") {
            console.log("[OAuthRelay] Profile refinement: Updating placeholder name...");
            await sdk.store.customer.update(
              { first_name: firstName, last_name: lastName || "Guest" },
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            userResult = await getCurrentUser();
          }
        }

        setStatus("Welcome Back ✨");
        setTimeout(() => navigate("/account"), 1200);

      } catch (err) {
        console.error("[OAuthRelay] Handshake Failed:", err.message);
        navigate(`/auth?error=${encodeURIComponent(err.message)}`);
      }
    };

    finalizeAuth();
  }, [getCurrentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center space-y-12">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 border-[0.5px] border-stone-200 rounded-full" />
          <div className="absolute inset-0 border-[0.5px] border-stone-900 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-[10px] uppercase tracking-[0.5em] text-stone-900/40 font-serif">Aroha</span>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-stone-900 font-serif text-4xl italic font-light tracking-tight">{status}</h2>
          <p className="text-stone-400 text-[10px] uppercase tracking-[0.6em] font-medium animate-pulse">Finalizing Handshake</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthRelay;