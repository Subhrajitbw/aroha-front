// src/pages/AuthPage.jsx
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, Mail, Lock, User, ShoppingBag, Clock, Heart, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useAuthModalStore } from "../stores/useAuthModalStore";
import { motion, AnimatePresence } from "framer-motion";
import { sdk } from "../lib/medusaClient";

const AuthPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState("login"); // login, register, forgot

  const heroImageRef = useRef();

  const {
    login,
    register,
    forgotPassword,
    initiateSocialAuth,
    getCurrentUser,
    isLoading: authStoreLoading,
    error: authError,
    setError: setAuthError,
    user
  } = useAuthStore();

  const {
    close,
    mode,
    error: modalError,
    clearError: clearModalError,
    isOpen
  } = useAuthModalStore();

  const isLoading = authStoreLoading;

  useEffect(() => {
    if (mode) setView(mode);
  }, [mode]);

  useEffect(() => {
    // Check for error parameters in the URL (sent by OAuthRelay)
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setLocalError(decodeURIComponent(urlError));
      // Clean the URL so the error doesn't persist on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user) close();
  }, [user, close]);

  useEffect(() => {
    if (!isOpen || !heroImageRef.current) return;
    gsap.fromTo(heroImageRef.current,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: "power3.out" }
    );
  }, [isOpen]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (localError) setLocalError("");
  };

  const handleFacebookResponse = async (response) => {
    if (!response?.accessToken) return;
    try {
      const result = await handleFacebookToken(response.accessToken, response.userID);
      if (!result.success) setLocalError(result.message);
    } catch {
      setLocalError('Facebook connection failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    try {
      let result;
      if (view === "forgot") {
        result = await forgotPassword(formData.email);
        if (result.success) {
          setLocalError(result.message);
        } else {
          setLocalError(result.message);
        }
        return;
      }

      if (view === "register") {
        const parts = formData.fullName.trim().split(/\s+/);
        result = await register({
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });
      } else {
        result = await login({ email: formData.email, password: formData.password });
      }

      if (!result?.success) setLocalError(result?.message || `Authorization failed.`);
    } catch (error) {
      setLocalError('Something went wrong. Please try again.');
    }
  };

  const displayError = localError || modalError || authError;

  return (
    <div className="w-full flex flex-col lg:flex-row min-h-[520px]">

      {/* Left — Visual panel */}
      <div className="hidden lg:block lg:w-[44%] relative overflow-hidden bg-stone-100">
        <div ref={heroImageRef} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop"
            alt="Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/50 via-stone-900/20 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-end h-full p-10 lg:p-14">
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <h2
                  className="text-3xl lg:text-4xl text-white leading-snug"
                  style={{ fontFamily: "'EB Garamond', 'Georgia', serif" }}
                >
                  {view === "login" && "Welcome back."}
                  {view === "register" && "Join our community."}
                  {view === "forgot" && "We'll help you recover."}
                </h2>
                <p className="text-white/60 text-sm max-w-xs leading-relaxed">
                  {view === "login" && "Sign in to access your orders, wishlist, and curated collections."}
                  {view === "register" && "Create your account and start exploring our premium collections."}
                  {view === "forgot" && "Enter your email and we'll send you a recovery link."}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-6 pt-4">
              {[
                { icon: ShoppingBag, label: "Track Orders" },
                { icon: Heart, label: "Wishlist" },
                { icon: Clock, label: "Fast Checkout" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon size={13} className="text-white/50" strokeWidth={1.5} />
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-14 xl:p-20">
        <div className="max-w-sm w-full mx-auto space-y-8">

          {/* Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <h1
                className="text-3xl text-stone-900"
                style={{ fontFamily: "'EB Garamond', 'Georgia', serif" }}
              >
                {view === "login" && "Sign In"}
                {view === "register" && "Create Account"}
                {view === "forgot" && "Reset Password"}
              </h1>
              <p className="text-sm text-stone-400">
                {view === "login" && "Enter your credentials to continue."}
                {view === "register" && "Fill in your details to get started."}
                {view === "forgot" && "We'll send a recovery link to your email."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-3.5">
              {view === "register" && (
                <>
                  <div className="relative">
                    <label className="block text-[11px] text-stone-500 font-medium mb-1.5 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full bg-stone-50 rounded-xl border border-stone-200 px-4 py-3 text-stone-900 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all duration-300 placeholder-stone-300"
                      />
                      <User className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300" size={15} strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[11px] text-stone-500 font-medium mb-1.5 uppercase tracking-wider">Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        placeholder="+91 00000 00000"
                        className="w-full bg-stone-50 rounded-xl border border-stone-200 px-4 py-3 text-stone-900 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all duration-300 placeholder-stone-300"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] text-stone-500 font-medium mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full bg-stone-50 rounded-xl border border-stone-200 px-4 py-3 text-stone-900 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all duration-300 placeholder-stone-300"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300" size={15} strokeWidth={1.5} />
                </div>
              </div>

              {view !== "forgot" && (
                <div>
                  <label className="block text-[11px] text-stone-500 font-medium mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 rounded-xl border border-stone-200 px-4 py-3 pr-20 text-stone-900 text-sm outline-none focus:border-stone-400 focus:bg-white transition-all duration-300 placeholder-stone-300"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-stone-300 hover:text-stone-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <Lock className="text-stone-300" size={15} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {view === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error display */}
            <AnimatePresence>
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                    {displayError.includes("dispatched") ? (
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle size={15} className="text-red-400 shrink-0" />
                    )}
                    <span className="text-xs">{displayError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span className="text-sm font-medium tracking-wide">
                {isLoading ? "Please wait..." : (
                  view === "login" ? "Sign In" :
                    view === "register" ? "Create Account" :
                      "Send Reset Link"
                )}
              </span>
              {!isLoading && <ArrowRight size={15} strokeWidth={2} />}
            </button>
          </form>

          {/* Social auth */}
          <div className="space-y-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100" /></div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs text-stone-300">or continue with</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              {[
                {
                  id: "google",
                  logo: "https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png",
                  alt: "Google"
                },
                {
                  id: "facebook",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
                  alt: "Facebook"
                },
                {
                  id: "pinterest",
                  logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png",
                  alt: "Pinterest"
                }
              ].map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => initiateSocialAuth(provider.id)}
                  className="w-14 h-14 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-900 transition-all duration-500 bg-white group"
                  title={`Continue with ${provider.alt}`}
                >
                  <img
                    src={provider.logo}
                    className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                    alt={provider.alt}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Footer toggle */}
          <div className="text-center pt-2">
            {view === "forgot" ? (
              <button
                onClick={() => setView("login")}
                className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to sign in
              </button>
            ) : (
              <p className="text-sm text-stone-400">
                {view === "login" ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setView(view === "login" ? "register" : "login")}
                  className="ml-1.5 text-stone-700 font-medium hover:text-stone-900 transition-colors"
                >
                  {view === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            )}
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 opacity-30">
            <ShieldCheck size={13} strokeWidth={1.5} />
            <span className="text-[10px] text-stone-500 uppercase tracking-wider">Secure SSL Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
