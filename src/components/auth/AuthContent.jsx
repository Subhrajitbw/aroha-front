// src/components/auth/AuthContent.jsx
import React, { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { useAuthStore } from  "@/stores/useAuthStore";
import { useAuthModalStore } from  "@/stores/useAuthModalStore";
import { motion, AnimatePresence } from "framer-motion";
import { sdk } from  "@/lib/medusaClient";

// Fallback images in case products haven't loaded yet
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1583847268964-b28e5039e14a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=600&auto=format&fit=crop",
];

const AnimatedColumn = ({ images, reverse = false, speed = 40 }) => (
  <motion.div
    initial={{ y: reverse ? "-50%" : "0%" }}
    animate={{ y: reverse ? "0%" : "-50%" }}
    transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    className="flex flex-col gap-3 sm:gap-4 w-1/3 lg:w-56 flex-shrink-0"
  >
    {[...images, ...images].map((src, i) => (
      <div key={i} className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-stone-200/40">
        <img src={src} alt="Product" loading="lazy" className="w-full h-full object-cover" />
      </div>
    ))}
  </motion.div>
);

const AuthContent = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: ""
  });
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState("login");
  const [productImages, setProductImages] = useState([]);

  const { login, register, forgotPassword, initiateSocialAuth, isLoading: authStoreLoading, error: authError, user } = useAuthStore();
  const { close, mode, error: modalError, isOpen } = useAuthModalStore();

  const isLoading = authStoreLoading;

  // Fetch real product images from Medusa store
  useEffect(() => {
    const fetchProductImages = async () => {
      try {
        const { products } = await sdk.store.product.list({
          limit: 15,
          fields: "id,title,thumbnail,images",
        });
        const images = products
          .map((p) => p.thumbnail || p.images?.[0]?.url)
          .filter(Boolean);
        if (images.length >= 9) {
          setProductImages(images.slice(0, 9));
        } else if (images.length > 0) {
          // Pad with fallback images if we don't have enough
          const padded = [...images, ...FALLBACK_IMAGES.slice(0, 9 - images.length)];
          setProductImages(padded.slice(0, 9));
        }
      } catch (err) {
        console.warn("AuthContent: Could not fetch product images, using fallbacks.", err);
      }
    };
    fetchProductImages();
  }, []);

  // Use fetched product images or fallbacks
  const collageImages = useMemo(
    () => (productImages.length >= 9 ? productImages : FALLBACK_IMAGES),
    [productImages]
  );

  useEffect(() => {
    if (mode) setView(mode);
  }, [mode]);

  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setLocalError(decodeURIComponent(urlError));
      window.history.replaceState({}, document.title, pathname);
    }
  }, [pathname]);

  useEffect(() => {
    if (user) close();
  }, [user, close]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    try {
      let result;
      if (view === "forgot") {
        result = await forgotPassword(formData.email);
        setLocalError(result.message);
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
    } catch {
      setLocalError('Something went wrong. Please try again.');
    }
  };

  const displayError = localError || modalError || authError;

  return (
    <div className="relative flex flex-col lg:flex-row w-full h-[100dvh] lg:h-[88vh] lg:min-h-[600px] overflow-hidden bg-stone-50 font-sans selection:bg-stone-200">

      {/* ========== Left / Background: Animated Product Collage ========== */}
      <div className="absolute inset-0 lg:relative lg:w-[45%] lg:h-full z-0 overflow-hidden flex justify-center items-center pointer-events-none bg-stone-100/50">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] lg:w-[150%] h-[80vw] lg:h-[150%] bg-amber-100/80 rounded-full blur-[100px] lg:blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[10%] lg:right-[-20%] w-[70vw] lg:w-[150%] h-[70vw] lg:h-[150%] bg-stone-200/80 rounded-full blur-[80px] lg:blur-[100px] mix-blend-multiply" />

        <div className="flex gap-3 sm:gap-4 transform -rotate-[6deg] scale-[1.6] sm:scale-[1.4] lg:scale-[1.1] w-[160vw] sm:w-[130vw] lg:w-[120%] justify-center">
          <AnimatedColumn images={collageImages.slice(0, 3)} speed={45} />
          <AnimatedColumn images={collageImages.slice(3, 6)} reverse speed={55} />
          <AnimatedColumn images={collageImages.slice(6, 9)} speed={50} />
        </div>
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] lg:hidden" />
      </div>

      {/* ========== Right / Foreground: Auth Form ========== */}
      <div className="relative z-10 w-full lg:w-[55%] h-full flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] rounded-[2rem] bg-white/90 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none border border-white/80 lg:border-none shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:shadow-none p-6 sm:p-8 lg:p-0"
        >
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 text-center lg:text-left"
              >
                <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight leading-tight">
                  {view === "login" && "Welcome back."}
                  {view === "register" && "Join Maison."}
                  {view === "forgot" && "Recover access."}
                </h1>
                <p className="text-sm text-stone-500 font-medium tracking-wide leading-relaxed">
                  {view === "login" && "Sign in to access your premium collections."}
                  {view === "register" && "Create your account for an exclusive experience."}
                  {view === "forgot" && "Enter your email for a secure recovery link."}
                </p>
              </motion.div>
            </AnimatePresence>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3.5">
                <AnimatePresence>
                  {view === "register" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3.5 overflow-hidden">
                      <div>
                        <label className="block text-[11px] text-stone-700 font-semibold mb-1.5 uppercase tracking-[0.1em]">Full Name</label>
                        <div className="relative group">
                          <input type="text" name="fullName" required={view === "register"} value={formData.fullName} onChange={handleInputChange} placeholder="John Doe"
                            className="w-full bg-white rounded-xl border border-stone-200 px-4 py-3 text-stone-900 text-sm outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all duration-300 placeholder-stone-400 shadow-sm"
                          />
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" size={16} strokeWidth={2} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-700 font-semibold mb-1.5 uppercase tracking-[0.1em]">Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 000 000 0000"
                          className="w-full bg-white rounded-xl border border-stone-200 px-4 py-3 text-stone-900 text-sm outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all duration-300 placeholder-stone-400 shadow-sm"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[11px] text-stone-700 font-semibold mb-1.5 uppercase tracking-[0.1em]">Email</label>
                  <div className="relative group">
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="you@example.com"
                      className="w-full bg-white rounded-xl border border-stone-200 px-4 py-3 text-stone-900 text-sm outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all duration-300 placeholder-stone-400 shadow-sm"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" size={16} strokeWidth={2} />
                  </div>
                </div>

                {view !== "forgot" && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[11px] text-stone-700 font-semibold uppercase tracking-[0.1em]">Password</label>
                      {view === "login" && (
                        <button type="button" onClick={() => setView("forgot")} className="text-[11px] font-medium text-stone-500 hover:text-stone-900 transition-colors">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleInputChange} placeholder="••••••••"
                        className="w-full bg-white rounded-xl border border-stone-200 px-4 py-3 pr-20 text-stone-900 text-sm outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 transition-all duration-300 placeholder-stone-400 shadow-sm"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-stone-400 hover:text-stone-700 transition-colors focus:outline-none">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {displayError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium
                      ${displayError.includes("dispatched") || displayError.includes("Check your email")
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-red-50 border-red-200 text-red-800"}`}>
                      {displayError.includes("dispatched") || displayError.includes("Check your email") ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                      )}
                      <span>{displayError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-3.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 text-sm font-semibold tracking-wide">
                  {isLoading ? "Processing..." : (view === "login" ? "Sign In" : view === "register" ? "Create Account" : "Send Recovery Link")}
                </span>
                {!isLoading && <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />}
              </button>
            </form>

            <div className="space-y-4 pt-1">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
                <span className="relative px-3 text-[10px] text-stone-500 font-semibold uppercase tracking-[0.2em] bg-white/80 lg:bg-white backdrop-blur-md rounded-full py-1">or continue with</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                {[{id:"google",logo:"https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",alt:"Google"},{id:"facebook",logo:"https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",alt:"Facebook"}].map((provider) => (
                  <button key={provider.id} type="button" onClick={() => initiateSocialAuth(provider.id)} className="w-12 h-12 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center hover:bg-stone-50 hover:shadow transition-all duration-300 hover:scale-105">
                    <img src={provider.logo} className="w-5 h-5 object-contain" alt={provider.alt} />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-1">
              <p className="text-sm text-stone-500 font-medium">
                {view === "forgot" ? (
                  <button onClick={() => setView("login")} className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Return to Login
                  </button>
                ) : (
                  <>
                    {view === "login" ? "New to Maison Aroha?" : "Already part of Maison?"}
                    <button onClick={() => setView(view === "login" ? "register" : "login")} className="ml-2 text-stone-900 font-bold hover:underline underline-offset-4 decoration-stone-300 transition-all">
                      {view === "login" ? "Create an account" : "Sign in"}
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthContent;
