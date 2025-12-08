// components/AuthPage.js
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, Lock, Mail, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login';
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
  const [passwordStrength, setPasswordStrength] = useState(0);

  const containerRef = useRef();
  const formRef = useRef();
  const heroRef = useRef();

  const navigate = useNavigate();
  
  // Zustand stores
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

  // Close modal and navigate on successful authentication
  useEffect(() => {
    if (!user) return;
    updateActivity();
    close();
  }, [user, updateActivity, close, navigate, redirectPath]);

  // GSAP Animations
  useEffect(() => {
    if (!isOpen) return;
    const tl = gsap.timeline();
    tl.fromTo(containerRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" })
      .fromTo(formRef.current, { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.2")
      .fromTo(heroRef.current, { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.4");
  }, [isOpen]);

  // Clear errors when switching modes
  useEffect(() => {
    setLocalError("");
    setAuthError(null);
    clearModalError();
  }, [mode, setAuthError, clearModalError]);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError("");
    if (name === 'password') setPasswordStrength(checkPasswordStrength(value));
  };

  const parseFullName = (name) => {
    const parts = name.trim().split(/\s+/);
    return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setLocalError("Please fill in all required fields.");
      return false;
    }

    if (isRegister && !formData.fullName.trim()) {
      setLocalError("Please enter your full name.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Please enter a valid email address.");
      return false;
    }

    if (isRegister) {
      if (formData.password.length < 8) {
        setLocalError("Password must be at least 8 characters long.");
        return false;
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
        setLocalError("Password must contain uppercase, lowercase, number, and special character.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError("Passwords do not match.");
        return false;
      }
    } else {
      if (formData.password.length < 6) {
        setLocalError("Password must be at least 6 characters long.");
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
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      }

      if (!result?.success) {
        setLocalError(result?.message || `${isRegister ? 'Registration' : 'Login'} failed. Please try again.`);
      }
      // On success, modal closes automatically via user effect
    } catch (error) {
      console.error('Auth error:', error);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLocalError("");
    try {
      const result = await handleGoogleCredential(credentialResponse.credential);
      if (!result.success) {
        setLocalError(result.message);
      }
      // Modal closes automatically on success
    } catch (error) {
      setLocalError('Google authentication failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setLocalError('Google authentication failed. Please try again.');
  };

  const handleFacebookResponse = async (response) => {
    if (!response?.accessToken || !response?.userID) {
      setLocalError('Facebook authentication failed. Please try again.');
      return;
    }

    setLocalError("");
    try {
      const result = await handleFacebookToken(response.accessToken, response.userID);
      if (!result.success) {
        setLocalError(result.message);
      }
      // Modal closes automatically on success
    } catch (error) {
      setLocalError('Facebook authentication failed. Please try again.');
    }
  };

  const handleToggle = () => {
    setLocalError("");
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
    setPasswordStrength(0);
    
    gsap.to(formRef.current, {
      x: 24,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setMode(isRegister ? 'login' : 'register');
        gsap.fromTo(formRef.current, { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
      },
    });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const displayError = localError || modalError || authError;
  const isFormDisabled = isLoading;

  return (
    <div ref={containerRef} className="w-full flex flex-col md:flex-row bg-white rounded-xl overflow-hidden relative">
      <div className="max-w-6xl w-full flex bg-white rounded-xl shadow-sm overflow-hidden border border-stone-200">
        
        {/* Hero Section */}
        <div ref={heroRef} className="hidden md:flex md:w-1/2 p-6 lg:p-12 flex-col justify-between bg-stone-100">
          <div>
            <h1 className="text-stone-800 text-3xl font-light mb-3 tracking-wide">ATELIER MAISON</h1>
            <p className="text-stone-600 text-lg">Curated elegance for your living spaces</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="overflow-hidden rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=500&fit=crop" 
                alt="Nordic Collection" 
                className="w-full h-auto object-cover hover:scale-105 transition duration-500" 
              />
              <p className="text-stone-700 mt-3 text-sm font-medium">The Nordic Collection</p>
            </div>
            <div className="overflow-hidden rounded-lg mt-8">
              <img 
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop" 
                alt="Artisan Craftsmanship" 
                className="w-full h-auto object-cover hover:scale-105 transition duration-500" 
              />
              <p className="text-stone-700 mt-3 text-sm font-medium">Artisan Craftsmanship</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-6 lg:p-12">
          <div ref={formRef} className="max-w-md mx-auto">
            
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-2xl font-light text-stone-800 mb-2 tracking-wider">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-stone-500 text-sm tracking-wide">
                {isRegister 
                  ? "Join our community of discerning design lovers" 
                  : "Access your collection of handpicked pieces"
                }
              </p>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-600 text-sm">{displayError}</p>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="mb-8 space-y-3">
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="large"
                  theme="outline"
                  shape="rectangular"
                  width="100%"
                  text="continue_with"
                  disabled={isFormDisabled}
                />
              </div>

              <FacebookLogin
                appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                fields="name,email,picture"
                callback={handleFacebookResponse}
                render={renderProps => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={isFormDisabled || renderProps.isDisabled}
                    className="w-full flex items-center justify-center py-3 px-4 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors text-stone-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                      alt="Facebook logo"
                      className="h-5 w-5 mr-3"
                    />
                    Continue with Facebook
                  </button>
                )}
              />
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-stone-500 tracking-wider">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {isRegister && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required={isRegister}
                    autoComplete="name"
                    disabled={isFormDisabled}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  disabled={isFormDisabled}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={isRegister ? 8 : 6}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  disabled={isFormDisabled}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  disabled={isFormDisabled}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator for Registration */}
              {isRegister && formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Password strength</span>
                    <span>{getPasswordStrengthText()}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {isRegister && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full pl-10 pr-12 py-3 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={isRegister}
                    autoComplete="new-password"
                    disabled={isFormDisabled}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    disabled={isFormDisabled}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              )}

              {/* Forgot Password Link */}
              {!isRegister && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-stone-600 hover:text-stone-800 transition-colors disabled:opacity-50"
                    disabled={isFormDisabled}
                    onClick={() => {
                      console.log('Forgot password clicked');
                    }}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isFormDisabled}
                className="w-full py-3 px-4 bg-stone-800 text-white hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center rounded-lg font-medium"
              >
                {isFormDisabled ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    {isRegister ? "Create Account" : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Privacy Policy Agreement for Registration */}
            {isRegister && (
              <div className="mt-6 text-center">
                <p className="text-xs text-stone-500">
                  By creating an account, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-stone-700">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="underline hover:text-stone-700">Privacy Policy</a>
                </p>
              </div>
            )}

            {/* Toggle Form */}
            <div className="mt-8 text-center">
              <p className="text-stone-500 text-sm">
                {isRegister ? "Already have an account?" : "New to Atelier Maison?"}{" "}
                <button 
                  onClick={handleToggle} 
                  disabled={isFormDisabled}
                  className="text-stone-700 hover:text-stone-900 font-medium underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegister ? "Sign In" : "Create Account"}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
