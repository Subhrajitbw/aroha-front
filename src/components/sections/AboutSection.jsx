import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { sanityClient } from "@/lib/sanityClient";

function AboutSection({ onVideoClick }) {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });

  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView) {
      setIsVideoExpanded(false);
    }
  }, [inView]);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await sanityClient.fetch(
          `*[_type == "about"][0]{
            heroTitle,
            heroSubtitle,
            heroVideo{
              asset->{
                url
              }
            },
            heroVideoUrl,
            heroImage{
              asset->{
                url
              }
            }
          }`
        );
        setAbout(data);
      } catch (error) {
        console.error("Error fetching about:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const handleVideoClick = () => {
    setIsVideoExpanded(true);
    if (onVideoClick) onVideoClick();
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#efe8e0]">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const videoUrl = about?.heroVideo?.asset?.url || about?.heroVideoUrl || "https://assets.mixkit.co/videos/4046/4046-720.mp4";
  const posterUrl = about?.heroImage?.asset?.url;

  return (
    <div ref={ref} className="h-full w-full overflow-hidden bg-[#efe8e0] px-4">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full h-full flex flex-col justify-center relative pb-[calc(96px+env(safe-area-inset-bottom,0px))] md:px-12 lg:px-20 pt-0 md:pt-0"
      >
        {!isVideoExpanded ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 lg:gap-16 w-full items-center max-w-7xl mx-auto h-full min-h-0 pt-[var(--nav-height,56px)] md:pt-0">

            {/* Left Narrative Column */}
            <div className="col-span-1 md:col-span-7 flex flex-col items-start text-left gap-3 md:gap-6 min-h-0">
              <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium text-stone-500">
                The Heritage
              </span>
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-serif italic text-stone-900 tracking-tight leading-[1.1] font-light max-w-xl">
                {about?.heroTitle || "About Aroha"}
              </h2>
              <div className="w-12 h-px bg-stone-400/60 my-0.5 md:my-1" />
              <p className="text-xs md:text-base lg:text-lg text-stone-600 leading-relaxed font-light max-w-xl line-clamp-4 md:line-clamp-none">
                {about?.heroSubtitle ||
                  "We craft sanctuary spaces that marry timeless Indian artistry with clean global minimalism. Every piece is an heirloom, designed to invite warmth, luxury, and stillness into your modern home."}
              </p>

              <Link
                href="/lookbook"
                className="group inline-flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium text-stone-500 hover:text-stone-900 transition-colors mt-2"
              >
                Discover Our Craft
                <div className="w-6 h-px bg-stone-400 group-hover:w-10 group-hover:bg-stone-900 transition-all duration-300" />
              </Link>
            </div>

            {/* Right Media Column */}
            <div className="col-span-1 md:col-span-5 flex items-center justify-center min-h-0">
              <motion.div
                layout
                onClick={handleVideoClick}
                className="relative w-full aspect-[16/10] md:aspect-[3/4] max-h-[25vh] md:max-h-[60vh] rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] cursor-pointer group/video border border-stone-200/20"
              >
                <video
                  src={videoUrl || null}
                  poster={posterUrl || null}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover/video:scale-105"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                {/* Floating Play Indicator overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover/video:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5 text-white fill-white translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Fullscreen Video Modal View */
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <motion.div
              layout
              className="relative w-full h-full"
            >
              <video
                src={videoUrl || null}
                poster={posterUrl || null}
                className="w-full h-full object-contain"
                autoPlay
                controls
                playsInline
              />
              <button
                onClick={() => setIsVideoExpanded(false)}
                className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default AboutSection;
