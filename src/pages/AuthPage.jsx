// src/pages/AuthPage.jsx
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck, Mail, Lock, User, ShoppingBag, Clock, Heart, CheckCircle2 } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { useAuthStore } from "../stores/useAuthStore";
import { useAuthModalStore } from "../stores/useAuthModalStore";
import { motion, AnimatePresence } from "framer-motion";

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
    handleGoogleCredential,
    handleFacebookToken,
    isLoading, 
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

  useEffect(() => {
    if (mode) setView(mode);
  }, [mode]);

  useEffect(() => {
    if (user) close();
  }, [user, close]);

  useEffect(() => {
    if (!isOpen) return;
    const tl = gsap.timeline();
    tl.fromTo(heroImageRef.current, 
      { scale: 1.15, filter: "brightness(0.3)" }, 
      { scale: 1, filter: "brightness(1)", duration: 2.5, ease: "power4.out" }
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
          setLocalError(result.message); // Show success message
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

      if (!result?.success) setLocalError(result?.message || `Authorization unfulfilled.`);
    } catch (error) {
      setLocalError('Systems are currently stabilizing. Please try again.');
    }
  };

  const benefits = [
    { icon: ShoppingBag, title: "Order Management", desc: "Track shipments and view archival history." },
    { icon: Heart, title: "Curated Wishlist", desc: "Save objects for future space planning." },
    { icon: Clock, title: "Expedited Checkout", desc: "Securely store your delivery preferences." }
  ];

  const displayError = localError || modalError || authError;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-white overflow-hidden">
      
      {/* Dynamic Archival Collage Section (42%) */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-center p-12 overflow-hidden bg-stone-50 border-r border-stone-100">
        
        {/* Curated Collage Grid */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-4 p-8 transition-opacity duration-1000">
          {[
            { img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop", span: "col-span-3 row-span-3", delay: 0 },
            { img: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000&auto=format&fit=crop", span: "col-span-3 row-span-2", delay: 0.2 },
            { img: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1000&auto=format&fit=crop", span: "col-span-2 row-span-2", delay: 0.4 },
            { img: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=1000&auto=format&fit=crop", span: "col-span-4 row-span-2", delay: 0.1 },
            { img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop", span: "col-span-3 row-span-3", delay: 0.3 },
            { img: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?q=80&w=1000&auto=format&fit=crop", span: "col-span-3 row-span-2", delay: 0.5 },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: item.delay, ease: [0.16, 1, 0.3, 1] }}
              className={`relative overflow-hidden rounded-none border border-stone-100 shadow-sm transition-all duration-[2s] ${item.span}`}
            >
              <img 
                src={item.img} 
                alt="Object" 
                className="w-full h-full object-cover transition-transform duration-[3s] hover:scale-105" 
              />
            </motion.div>
          ))}
        </div>

        {/* Cinematic Content Overlay */}
        <div className="relative z-10 space-y-8 bg-white/60 backdrop-blur-xl p-12 border border-stone-200/50 shadow-2xl max-w-lg mx-auto">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <Sparkles className="text-stone-400" size={16} strokeWidth={1} />
               <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold">Curated Discovery</span>
             </div>
             <h2 className="text-4xl font-serif italic text-stone-900 leading-[1.1] tracking-tight">
               Archival Objects <br />
               <span className="text-stone-300">for the modern space.</span>
             </h2>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {view === "register" ? (
                <motion.div
                  key="reg-info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid gap-6">
                    {benefits.slice(0, 2).map((b, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-stone-200 bg-white">
                          <b.icon size={12} strokeWidth={1} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[10px] uppercase tracking-widest text-stone-900 font-bold">{b.title}</h4>
                          <p className="text-[9px] text-stone-500 leading-relaxed uppercase tracking-tighter">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="login-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-stone-400 text-[9px] uppercase tracking-[0.2em] font-bold max-w-xs leading-relaxed">
                    Trusted by architects and archival specialists globally. Establish your archive access.
                  </p>
                  <div className="flex items-center gap-4">
                     <span className="block text-[10px] uppercase tracking-widest text-stone-900 font-bold">12k+ Active Collectors</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Structured Interface Section */}
      <div className="w-full lg:w-3/5 p-8 lg:p-20 flex flex-col justify-center bg-white border-l border-stone-100">
        <div className="max-w-md w-full mx-auto space-y-10">
          
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl font-serif italic text-stone-900">
                  {view === "login" && "Archive Access"}
                  {view === "register" && "Create Identity"}
                  {view === "forgot" && "Reset Access"}
                </h1>
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] mt-3 font-bold">
                  {view === "login" && "Enter your credentials to continue exploration."}
                  {view === "register" && "Join our global community of collectors."}
                  {view === "forgot" && "Securely recover your archival identity."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {view === "register" && (
                <>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-[8px] uppercase tracking-widest text-stone-400 font-bold">Full Identity</span>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-stone-50 border border-stone-100 pt-7 pb-3 px-4 text-stone-900 outline-none focus:border-stone-900 transition-all text-sm font-medium"
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} strokeWidth={1.5} />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-[8px] uppercase tracking-widest text-stone-400 font-bold">Mobile Link</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="+91 00000 00000"
                      className="w-full bg-stone-50 border border-stone-100 pt-7 pb-3 px-4 text-stone-900 outline-none focus:border-stone-900 transition-all text-sm font-medium"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} strokeWidth={1.5} />
                  </div>
                </>
              )}

              <div className="relative">
                  <span className="absolute left-4 top-3 text-[8px] uppercase tracking-widest text-stone-400 font-bold">Inquiry Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-100 pt-7 pb-3 px-4 text-stone-900 outline-none focus:border-stone-900 transition-all text-sm font-medium"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} strokeWidth={1.5} />
              </div>

              {view !== "forgot" && (
                <div className="relative">
                  <span className="absolute left-4 top-3 text-[8px] uppercase tracking-widest text-stone-400 font-bold">Security Credential</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-stone-50 border border-stone-100 pt-7 pb-3 px-4 text-stone-900 outline-none focus:border-stone-900 transition-all text-sm font-medium"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-stone-300 hover:text-stone-900">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Lock className="text-stone-300" size={16} strokeWidth={1.5} />
                  </div>
                </div>
              )}
            </div>

            {view === "login" && (
               <div className="flex justify-end">
                  <button type="button" onClick={() => setView("forgot")} className="text-[9px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors font-bold">
                    Credential Recovery?
                  </button>
               </div>
            )}

            <AnimatePresence>
              {displayError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-stone-50 border-l-2 border-stone-900 flex items-center gap-3 text-[10px] uppercase tracking-widest text-stone-900 font-bold"
                >
                  {displayError.includes("dispatched") ? <CheckCircle2 size={14} className="text-green-600" /> : <AlertCircle size={14} className="text-red-500" />}
                  {displayError}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-stone-900 text-white hover:opacity-90 transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn"
            >
              <span className="text-xs uppercase tracking-[0.4em] font-bold">
                {isLoading ? "Synchronizing..." : (
                  view === "login" ? "Enter Identity" : 
                  view === "register" ? "Confirm Identity" : 
                  "Send Recovery Link"
                )}
              </span>
              <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-2" strokeWidth={1.5} />
            </button>
          </form>

          {/* Institutional Access Providers */}
          <div className="space-y-6 pt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
              <div className="relative flex justify-center text-center">
                <span className="px-6 bg-white text-[9px] uppercase tracking-[0.3em] text-stone-300 font-bold">Or authenticate via provider</span>
              </div>
            </div>

            <div className="flex gap-4">
               <div className="flex-1 h-14 border border-stone-200 dark:border-white/10 flex items-center justify-center hover:bg-stone-50 transition-colors cursor-pointer relative overflow-hidden grayscale opacity-50 hover:opacity-100 hover:grayscale-0">
                  <GoogleLogin
                    onSuccess={(res) => handleGoogleCredential(res.credential)}
                    onError={() => setLocalError('Google sync failed')}
                    type="icon"
                    theme="outline"
                  />
               </div>
               <FacebookLogin
                appId={import.meta.env.VITE_FACEBOOK_APP_ID || "temp"}
                callback={handleFacebookResponse}
                render={renderProps => (
                  <button onClick={renderProps.onClick} className="flex-1 h-14 border border-stone-200 dark:border-white/10 text-[9px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-all">
                    Facebook
                  </button>
                )}
              />
            </div>
          </div>

          {/* Footer View Toggle */}
          <div className="text-center pt-8 border-t border-stone-100">
             {view === "forgot" ? (
               <button onClick={() => setView("login")} className="flex items-center gap-2 mx-auto text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors font-bold group">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Return to Archive Access
               </button>
             ) : (
               <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                 {view === "login" ? "New to the atelier?" : "Already registered?"}
                 <button 
                   onClick={() => setView(view === "login" ? "register" : "login")}
                   className="ml-2 text-stone-900 border-b border-stone-900 leading-none pb-0.5 hover:opacity-60 transition-opacity"
                 >
                   {view === "login" ? "Create Identity" : "Access Archive"}
                 </button>
               </div>
             )}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 opacity-20 group-hover:opacity-40 transition-opacity">
             <ShieldCheck size={16} />
             <span className="text-[8px] uppercase tracking-[0.3em] font-bold">Secure SSL Authentication Environment</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
