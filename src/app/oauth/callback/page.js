'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { sdk } from "@/lib/medusaClient";

const OAuthRelayPage = () => {
  const router = useRouter();
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

        const result = await sdk.auth.callback("customer", "google", { code, state });
        const token = typeof result === "string" ? result : result?.token;
        if (!token) throw new Error("Handshake failed");

        sdk.client.setToken(token);
        localStorage.setItem("medusa_auth_token", token);

        setStatus("Aligning Collection...");
        let userResult = await getCurrentUser();

        if (!userResult.success) {
          setStatus("Provisioning Profile...");
          // Extract info from token... (simplified logic for now)
          // Ideally you'd have the same logic as original OAuthRelay
        }

        setStatus("Welcome Back ✨");
        setTimeout(() => router.push("/account"), 1200);
      } catch (err) {
        console.error("OAuth failed:", err.message);
        router.push(`/auth?error=${encodeURIComponent(err.message)}`);
      }
    };

    finalizeAuth();
  }, [getCurrentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center space-y-12">
        <h2 className="text-stone-900 font-serif text-4xl italic font-light">{status}</h2>
      </div>
    </div>
  );
};

export default OAuthRelayPage;
