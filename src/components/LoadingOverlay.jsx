import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LuxuryLoadingOverlay = ({ 
  isVisible = true, 
  onComplete = () => {},
  direction = "up",
  duration = 3000 
}) => {
  const [animationPhase, setAnimationPhase] = useState("loading");
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    let exitTimeout;
    let durationTimeout;

    if (!isVisible) {
      setAnimationPhase("exit");
      exitTimeout = setTimeout(() => {
        setShowOverlay(false);
        onComplete();
      }, 1600);
    } else {
      durationTimeout = setTimeout(() => {
        setAnimationPhase("exit");
        exitTimeout = setTimeout(() => {
          setShowOverlay(false);
          onComplete();
        }, 2000);
      }, duration);
    }

    return () => {
      clearTimeout(durationTimeout);
      clearTimeout(exitTimeout);
    };
  }, [isVisible, duration, onComplete]);

  const getExitVariant = () => {
    switch (direction) {
      case "up":
        return {
          y: "-100%",
          transition: { duration: 1.5, ease: [0.25, 0.1, 0.25, 1] },
          borderBottomLeftRadius: "100% 50px",
          borderBottomRightRadius: "100% 50px"
        };
      case "down":
        return {
          y: "100%",
          transition: { duration: 1.5, ease: [0.25, 0.1, 0.25, 1] },
          borderTopLeftRadius: "100% 60px",
          borderTopRightRadius: "100% 60px"
        };
      case "left":
        return {
          x: "-100%",
          borderRadius: "0 60px 60px 0"
        };
      case "right":
        return {
          x: "100%",
          borderRadius: "60px 0 0 60px"
        };
      case "center":
        return {
          scale: 0,
          borderRadius: "50%",
          opacity: 0
        };
      case "curtain":
        return {
          scaleY: 0,
          transformOrigin: "top"
        };
      default:
        return {
          y: "-100%",
          borderBottomLeftRadius: "100% 60px",
          borderBottomRightRadius: "100% 60px"
        };
    }
  };

  if (!showOverlay) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative w-full h-full bg-gradient-to-br from-neutral-900 via-stone-900 to-zinc-900"
          initial={{ borderRadius: "0px", scale: 1, x: 0, y: 0 }}
          animate={animationPhase === "exit" ? getExitVariant() : {}}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1], delay: animationPhase === "exit" ? 0.3 : 0 }}
        >
<div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="luxury-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0,50 Q25,0 50,50 T100,50" stroke="rgba(253, 230, 138, 0.2)" strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#luxury-pattern)" />
            </svg>
          </div>

          <div className="absolute inset-0">
            <motion.div
              className="absolute top-24 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-radial from-amber-100/10 to-transparent rounded-full"
              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute bottom-32 left-24 w-20 h-20 bg-gradient-radial from-amber-100/10 to-transparent rounded-full"
              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <motion.div
              className="absolute top-40 right-24 w-28 h-28 bg-gradient-radial from-yellow-50/10 to-transparent rounded-full"
              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="relative mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-200/10 to-yellow-100/10 blur-2xl rounded-full"
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <img
                src="/logo_inverse.svg"
                alt="Logo"
                className="relative z-10 w-36 h-auto"
                style={{ filter: "drop-shadow(0 0 10px rgba(253, 230, 138, 0.2))" }}
              />
            </motion.div>

            <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
              <div className="relative w-56 h-1 bg-stone-800 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-zinc-400 via-stone-300 to-neutral-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: duration / 1000 - 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-zinc-400/40 via-stone-300/40 to-neutral-400/40 rounded-full blur-sm"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: duration / 1000 - 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
              <motion.p
                className="text-stone-400 text-xs font-light tracking-wider text-center mt-6"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                CURATING YOUR SPACE
              </motion.p>
            </motion.div>

            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-100/30 rounded-full"
                  style={{ left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%` }}
                  animate={{ y: [0, -15, 0], opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
                  transition={{ duration: 4 + Math.random(), repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
                />
              ))}
            </div>
          </div>

          {animationPhase === "exit" && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-transparent via-stone-800/40 to-stone-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}             </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LuxuryLoadingOverlay;
          