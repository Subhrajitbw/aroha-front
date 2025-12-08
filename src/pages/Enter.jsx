import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { gsap } from "gsap";
import LuxuryLoadingOverlay from "../components/LoadingOverlay";
import axios from "axios";

const Enter = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isEntering, setIsEntering] = useState(false);
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Static mapping of product IDs to their corresponding image IDs
  const imageIds = [
    "w-node-_6862112e-f479-c803-6ef5-83c8307aa526-5ff78dcc",
    "w-node-_6862112e-f479-c803-6ef5-83c8307aa527-5ff78dcc",
    "w-node-_6862112e-f479-c803-6ef5-83c8307aa528-5ff78dcc",
    "w-node-_6862112e-f479-c803-6ef5-83c8307aa529-5ff78dcc",
    "w-node-_6862112e-f479-c803-6ef5-83c8307aa52a-5ff78dcc",
    "w-node-_6862112e-f479-c803-6ef5-83c8307aa52b-5ff78dcc",
    "w-node-_6862112e-f479-c803-6ef5-83c8307aa52c-5ff78dcc",
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`, {headers: {
    "ngrok-skip-browser-warning": "true",
  },});
        setProducts(response.data?.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Initialize Webflow animations
    const pageElement = document.documentElement;
    pageElement.setAttribute("data-wf-page", "62ad735180e2904d5ff78dcc");

    setTimeout(() => {
      window.Webflow && window.Webflow.ready();
      window.Webflow && window.Webflow.require("ix2").init();
      document.dispatchEvent(new Event("readystatechange"));
    }, 100);

    // GSAP animation for image gallery
    setTimeout(() => {
      const element = document.querySelector(".enter-image-grid-inner");
      if (element) {
        gsap.fromTo(
          element,
          { translateY: "0vh" },
          {
            translateY: "-100vh",
            duration: 20,
            ease: "none",
            repeat: -1,
            yoyo: false,
          }
        );
      }
    }, 500);
  }, []);

  // Animated brand name component
  const AnimatedBrandName = ({ text }) => {
    const letters = text.split("");
    
    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={isHeroInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Background glow - minimal */}
        <motion.div
          className="absolute inset-0 text-8xl md:text-9xl lg:text-[12rem] font-thin tracking-[0.2em] text-white/5 blur-sm"
          initial={{ scale: 0.8 }}
          animate={isHeroInView ? { scale: 1 } : { scale: 0.8 }}
          transition={{ duration: 2, delay: 1 }}
        >
          {text}
        </motion.div>
        
        {/* Main text */}
        <div className="relative text-8xl md:text-9xl lg:text-[12rem] font-thin tracking-[0.2em] text-neutral-100 flex justify-center">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              className="inline-block"
              initial={{ 
                opacity: 0, 
                y: 100,
                rotateX: -90,
                scale: 0.8
              }}
              animate={isHeroInView ? { 
                opacity: 1, 
                y: 0,
                rotateX: 0,
                scale: 1
              } : {}}
              transition={{
                duration: 1.2,
                delay: 1 + (index * 0.1),
                ease: [0.25, 0.1, 0.25, 1],
                type: "spring",
                stiffness: 100
              }}
              whileHover={{
                scale: 1.1,
                textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
                transition: { duration: 0.3 }
              }}
              style={{
                textShadow: "0 0 10px rgba(255, 255, 255, 0.1)",
                filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.08))"
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Elegant underline - minimal */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-neutral-400 to-transparent"
          initial={{ width: "0%" }}
          animate={isHeroInView ? { width: "60%" } : { width: "0%" }}
          transition={{
            duration: 2,
            delay: 2.5,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />

        {/* Decorative diamonds - minimal */}
        <motion.div
          className="absolute -left-12 top-1/2 transform -translate-y-1/2 w-6 h-6 border border-neutral-500/30 rotate-45"
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={isHeroInView ? { opacity: 1, scale: 1, rotate: 45 } : {}}
          transition={{ duration: 1, delay: 3, ease: "easeOut" }}
        />
        
        <motion.div
          className="absolute -right-12 top-1/2 transform -translate-y-1/2 w-6 h-6 border border-neutral-500/30 rotate-45"
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={isHeroInView ? { opacity: 1, scale: 1, rotate: 45 } : {}}
          transition={{ duration: 1, delay: 3.2, ease: "easeOut" }}
        />
      </motion.div>
    );
  };

  // Luxury enter button component
  const LuxuryEnterButton = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={isHeroInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 1.5, delay: 3.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative group"
    >
      {/* Button glow effect - minimal */}
      <motion.div
        className="absolute inset-0 bg-white/5 rounded-full blur-xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <Link
        to="/home"
        className="relative block w-40 h-40 rounded-full border border-neutral-400/20 bg-gradient-to-br from-neutral-900/30 to-black/20 backdrop-blur-sm overflow-hidden group-hover:border-neutral-300/30 transition-all duration-500"
        onClick={() => setIsEntering(true)}
      >
        {/* Button background animation - minimal */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/5 transition-all duration-500"
          whileHover={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))"
          }}
        />

        {/* Ripple effect - minimal */}
        <motion.div
          className="absolute inset-0 rounded-full border border-white/10"
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.3, 0.1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />

        {/* Button content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-neutral-100 text-lg font-light tracking-wider mb-1"
              animate={{
                textShadow: [
                  "0 0 5px rgba(255, 255, 255, 0.1)",
                  "0 0 10px rgba(255, 255, 255, 0.2)",
                  "0 0 5px rgba(255, 255, 255, 0.1)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ENTER
            </motion.div>
            <motion.div
              className="w-8 h-px bg-gradient-to-r from-transparent via-neutral-400 to-transparent mx-auto"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>

        {/* Hover particles - minimal */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white/40 rounded-full"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0, 0.6, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </Link>
    </motion.div>
  );

  // Floating ambient elements - minimal
  const FloatingElements = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {/* Elegant floating orbs - minimal */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-radial from-white/5 to-transparent"
          style={{
            width: `${15 + Math.random() * 25}px`,
            height: `${15 + Math.random() * 25}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}

      {/* Geometric luxury elements - minimal */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={`geo-${i}`}
          className="absolute w-12 h-12 border border-neutral-500/10 rotate-45"
          style={{
            left: `${30 + i * 40}%`,
            top: `${40 + i * 20}%`,
          }}
          animate={{
            rotate: [45, 90, 45],
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 3,
          }}
        />
      ))}
    </div>
  );

  // Enhanced image gallery
  const LuxuryImageGallery = () => (
    <motion.div 
      className="enter-image-grid-wrapper absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.4 }}
      transition={{ duration: 2, delay: 1 }}
    >
      <div className="enter-image-grid-inner">
        {[0, 1].map((gridIndex) => (
          <div key={gridIndex} className="enter-images-grid">
            {products.slice(0, 7).map((product, index) => (
              <motion.div
                key={`${gridIndex}-${product._id}`}
                className="relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1,
                  delay: 2 + (index * 0.1),
                  ease: "easeOut"
                }}
              >
                <img
                  id={imageIds[index]}
                  src={product.images[0]}
                  loading="eager"
                  alt={product.name}
                  className="enter-images-image transition-all duration-500 hover:scale-105 hover:brightness-105 grayscale-[20%] hover:grayscale-0"
                />
                
                {/* Image overlay - minimal */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"
                  whileHover={{
                    background: "linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent)"
                  }}
                />

                {/* Hover glow - minimal */}
                <motion.div
                  className="absolute inset-0 bg-white/0"
                  whileHover={{
                    background: "rgba(255, 255, 255, 0.03)"
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="page-wrapper">
      <div className="global-styles w-embed">
        <style>
          {`
            .cursor-wrapper {
              pointer-events: none;
            }
            .journal-post:last-child .journal-post-line {
              display: none;
            }
            
            /* Custom luxury styles */
            .enter-images-image {
              transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
            }
            
            .enter-images-image:hover {
              filter: brightness(1.05) contrast(1.02) saturate(1.1);
            }
            
            /* Custom scrollbar */
            ::-webkit-scrollbar {
              display: none;
            }
            
            body {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}
        </style>
      </div>

      <AnimatePresence>
        {loading && (
          <LuxuryLoadingOverlay
            isVisible={loading}
            direction="up"
            duration={3000}
            brandName="AROHA"
            onComplete={() => setLoading(false)}
          />
        )}
      </AnimatePresence>

      <FloatingElements />

      <motion.main 
        className="main-wrapper relative min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Ambient background lighting - minimal */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/2 via-transparent to-neutral-800/5" />
        
        {/* Hero section */}
        <motion.section 
          ref={heroRef}
          className="section-enter relative min-h-screen flex items-center justify-center z-20"
        >
          {/* Background pattern - minimal */}
          <div className="absolute inset-0 opacity-3">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="luxury-hero-pattern"
                  x="0"
                  y="0"
                  width="200"
                  height="200"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M0,100 Q50,0 100,100 T200,100"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <circle cx="100" cy="100" r="1" fill="rgba(255, 255, 255, 0.05)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#luxury-hero-pattern)" />
            </svg>
          </div>

          <div className="enter-content text-center relative z-10">
            {/* Main brand name */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <AnimatedBrandName text="AROHA" />
            </motion.div>

            {/* Luxury tagline - minimal */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.2, delay: 4, ease: "easeOut" }}
            >
              <motion.p
                className="text-neutral-500 text-lg font-light tracking-[0.3em] mb-4"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                CURATED LUXURY • TIMELESS DESIGN
              </motion.p>
              
              <motion.div
                className="flex items-center justify-center space-x-6"
                initial={{ opacity: 0 }}
                animate={isHeroInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 4.5 }}
              >
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-neutral-500"></div>
                <span className="text-neutral-400 text-sm tracking-widest">EST. 2024</span>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-neutral-500"></div>
              </motion.div>
            </motion.div>

            {/* Enter button */}
            <LuxuryEnterButton />
          </div>

          {/* Chandelier lighting effect - minimal */}
          <motion.div
            className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-radial from-white/3 via-white/1 to-transparent rounded-full"
            animate={{
              opacity: [0.2, 0.4, 0.2, 0.3],
              scale: [1, 1.05, 0.98, 1.02],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.section>

        {/* Enhanced image gallery background */}
        <LuxuryImageGallery />

        {/* Elegant vignette overlay - minimal */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 pointer-events-none" />
      </motion.main>

      {/* Page transition overlay - minimal */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-black via-neutral-900/50 to-neutral-800 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Enter;
