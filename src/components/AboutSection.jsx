import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { sanityClient } from "../lib/sanityClient";

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
      <div className="h-screen flex items-center justify-center bg-[#efe8e0]">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const videoUrl = about?.heroVideo?.asset?.url || about?.heroVideoUrl || "./demo.mp4";
  const posterUrl = about?.heroImage?.asset?.url;

  return (
    <div ref={ref} className="h-screen p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className={`w-full h-full bg-[#efe8e0] flex flex-col justify-center overflow-hidden relative ${
          isVideoExpanded ? "rounded-none md:rounded-lg" : "rounded-lg"
        } ${isVideoExpanded ? "px-0 md:px-8" : "px-4 md:px-8"}`}
      >
        {!isVideoExpanded && (
          <>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-7xl text-[#333] text-center font-serif"
            >
              {about?.heroTitle || "About Us"}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full mt-8 px-4 md:text-left"
            >
              <div className="text-lg md:text-lg text-[#333] leading-relaxed font-light max-w-4xl mx-auto text-center">
                {about?.heroSubtitle || 
                  "Our mission is to provide a platform for students to share their experiences and insights with others. We believe that every story has the power to inspire, educate, and connect individuals across diverse backgrounds."}
              </div>
            </motion.div>
          </>
        )}

        <motion.div
          layout
          initial={false}
          animate={{
            scale: isVideoExpanded ? 1 : 0.8,
          }}
          transition={{
            layout: { duration: 0.8, type: "spring", bounce: 0.2 },
            scale: { duration: 0.8, ease: "easeOut" }
          }}
          onClick={!isVideoExpanded ? handleVideoClick : undefined}
          className={`${
            isVideoExpanded
              ? "fixed inset-0 z-50 flex items-center justify-center"
              : "relative w-80 md:w-60 mx-auto rounded-lg"
          } cursor-pointer overflow-hidden mt-8`}
        >
          <motion.video
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            src={videoUrl}
            poster={posterUrl}
            className={`${
              isVideoExpanded
                ? "w-full h-full object-cover"
                : "w-full aspect-video object-cover rounded-lg"
            }`}
            autoPlay
            muted
            loop
            playsInline
            style={{
              pointerEvents: isVideoExpanded ? "auto" : "none"
            }}
          />
          {!isVideoExpanded && (
            <div className="absolute inset-0 bg-transparent cursor-pointer" />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AboutSection;
