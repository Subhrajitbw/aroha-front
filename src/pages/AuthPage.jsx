// components/AuthPage.js
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { useAuthStore } from "../stores/useAuthStore";
import { useAuthModalStore } from "../stores/useAuthModalStore";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const containerRef = useRef();
  const formRef = useRef();
  const heroRef = useRef();

  const navigate = useNavigate();
  
  const { 
    login, 
    register, 
    handleGoogleCredential,
    handleFacebookToken,
    isLoading, 
    error: authError,
    setError: setAuthError,
    updateActivity,
    user
  } = useAuthStore();
  
  const { 
    close, 
    redirectPath, 
    mode, 
    setMode,
    error: modalError,
    clearError: clearModalError,
    isOpen
  } = useAuthModalStore();
  
  const isRegister = mode === 'register';

  useEffect(() => {
    if (!user) return;
    updateActivity();
    close();
  }, [user, updateActivity, close, navigate, redirectPath]);

  // GSAP Animations
  useEffect(() => {
    if (!isOpen) return;
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(formRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .fromTo(heroRef.current, { scale: 1.05, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, "-=0.8");
  }, [isOpen]);

  useEffect(() => {
    setLocalError("");
    setAuthError(null);
    clearModalError();
  }, [mode, setAuthError, clearModalError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError("");
  };

  const parseFullName = (name) => {
    const parts = name.trim().split(/\s+/);
    return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setLocalError("Please provide all required credentials.");
      return false;
    }
    if (isRegister && !formData.fullName.trim()) {
      setLocalError("Please provide your full identity.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Please provide a valid email address.");
      return false;
    }
    if (isRegister) {
      if (formData.password.length < 8) {
        setLocalError("Password must encompass at least 8 characters.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError("Authentication credentials do not match.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLocalError("");
    
    try {
      let result;
      if (isRegister) {
        const { firstName, lastName } = parseFullName(formData.fullName);
        const userData = {
          firstName,
          lastName,
          username: formData.email.split("@")[0],
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        };
        result = await register(userData);
      } else {
        result = await login({ email: formData.email, password: formData.password });
      }

      if (!result?.success) {
        setLocalError(result?.message || `Authentication unfulfilled. Please try again.`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setLocalError('An anomaly occurred within our records. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLocalError("");
    try {
      const result = await handleGoogleCredential(credentialResponse.credential);
      if (!result.success) setLocalError(result.message);
    } catch {
      setLocalError('Google authentication suspended. Please try again.');
    }
  };

  const handleFacebookResponse = async (response) => {
    if (!response?.accessToken || !response?.userID) {
      setLocalError('Facebook authentication suspended. Please try again.');
      return;
    }
    setLocalError("");
    try {
      const result = await handleFacebookToken(response.accessToken, response.userID);
      if (!result.success) setLocalError(result.message);
    } catch {
      setLocalError('Facebook authentication suspended. Please try again.');
    }
  };

  const handleToggle = () => {
    setLocalError("");
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
    
    gsap.to(formRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setMode(isRegister ? 'login' : 'register');
        gsap.fromTo(formRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
      },
    });
  };

  const displayError = localError || modalError || authError;
  const isFormDisabled = isLoading;

  return (
    <div ref={containerRef} className="w-full flex flex-col md:flex-row bg-[#fafafa] overflow-hidden min-h-[600px] md:min-h-[700px]">
      
      {/* Luxury Hero Image Context */}
      <div ref={heroRef} className="hidden md:block md:w-[45%] relative bg-stone-200">
        <img 
          src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2912&auto=format&fit=crop" 
          alt="Aroha Context" 
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.85] contrast-[1.1]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12">
          <span className="text-[10px] tracking-[0.3em] text-white/70 uppercase mb-4">The Collection</span>
          <h2 className="text-3xl font-serif text-white tracking-wide font-light leading-snug max-w-sm">
            Curating spaces of undeniable intention.
          </h2>
        </div>
      </div>

      {/* Auth Interface */}
      <div className="w-full md:w-[55%] p-10 md:p-16 lg:p-20 flex flex-col justify-center relative overflow-hidden bg-[#fafafa]">
        
        {/* Subtle Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
          <h1 className="font-serif text-[180px] tracking-tighter whitespace-nowrap">AROHA</h1>
        </div>

        <div ref={formRef} className="max-w-md w-full mx-auto relative z-10">
          
          <div className="mb-14">
            <h1 className="text-4xl font-serif text-stone-900 mb-4 tracking-wide font-light">
              {isRegister ? "Join Aroha" : "Welcome Back"}
            </h1>
            <p className="text-stone-500 text-[11px] uppercase tracking-[0.2em]">
              {isRegister 
                ? "Enter your details to create an account." 
                : "Enter your credentials to access your collection."
              }
            </p>
          </div>

          {displayError && (
            <div className="mb-8 p-4 bg-stone-100 border-l-2 border-stone-900 flex items-start">
              <AlertCircle className="h-4 w-4 text-stone-900 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-stone-800 text-xs tracking-wide leading-relaxed">{displayError}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="relative group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="w-full bg-transparent border-b border-stone-200 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:placeholder:text-transparent transition-all tracking-wide text-sm"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={isRegister}
                  disabled={isFormDisabled}
                />
              </div>
            )}

            <div className="relative group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full bg-transparent border-b border-stone-200 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:placeholder:text-transparent transition-all tracking-wide text-sm"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isFormDisabled}
              />
            </div>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full bg-transparent border-b border-stone-200 py-3 pr-10 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:placeholder:text-transparent transition-all tracking-wide text-sm"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={isRegister ? 8 : 6}
                disabled={isFormDisabled}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
                disabled={isFormDisabled}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {isRegister && (
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full bg-transparent border-b border-stone-200 py-3 pr-10 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:placeholder:text-transparent transition-all tracking-wide text-sm"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={isRegister}
                  disabled={isFormDisabled}
                />
              </div>
            )}

            {!isRegister && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="text-[10px] uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 transition-colors"
                  disabled={isFormDisabled}
                >
                  Forgot Identity?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isFormDisabled}
              className="group w-full py-4 mt-6 bg-stone-900 text-white hover:bg-black transition-all flex items-center justify-between px-6"
            >
              <span className="text-xs uppercase tracking-[0.2em] font-medium">
                {isFormDisabled ? "Processing..." : (isRegister ? "Establish Account" : "Access Identity")}
              </span>
              {!isFormDisabled && <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-14 mb-8 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
            <div className="relative flex justify-center text-center">
              <span className="px-4 bg-[#fafafa] text-[9px] uppercase tracking-[0.2em] text-stone-400">Or authenticate via provider</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 overflow-hidden h-[46px] border border-stone-200 hover:border-stone-900 transition-colors flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center pb-2 scale-[1.3] brightness-0 contrast-200 opacity-70 mix-blend-multiply hover:opacity-100 hover:brightness-100">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setLocalError('Google authentication suspended.')}
                  type="icon"
                  size="large"
                  theme="outline"
                  shape="rectangular"
                />
              </div>
              <span className="absolute pointer-events-none text-[10px] uppercase tracking-[0.1em] text-stone-900 opacity-0 group-hover:opacity-100">Google</span>
            </div>

            <FacebookLogin
              appId={import.meta.env.VITE_FACEBOOK_APP_ID || "temp"}
              callback={handleFacebookResponse}
              render={renderProps => (
                <button
                  onClick={renderProps.onClick}
                  disabled={isFormDisabled}
                  className="col-span-2 sm:col-span-1 h-[46px] border border-stone-200 hover:border-stone-900 transition-colors flex items-center justify-center group"
                  type="button"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-900 font-medium">Facebook</span>
                </button>
              )}
            />
          </div>

          <div className="mt-16 text-center">
            <p className="text-stone-500 text-xs font-light tracking-wide">
              {isRegister ? "Already hold an identity?" : "New to the atelier?"}{" "}
              <button 
                onClick={handleToggle} 
                disabled={isFormDisabled}
                className="text-stone-900 hover:text-black uppercase tracking-[0.1em] font-medium border-b border-stone-900 pb-0.5 ml-1 transition-colors"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
