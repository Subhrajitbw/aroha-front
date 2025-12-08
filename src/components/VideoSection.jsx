import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function VideoSection() {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });

  return (
    <div ref={ref} className="h-screen w-full rounded-lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="h-full w-full flex justify-center items-center"
      >
        <motion.iframe
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          src="https://player.vimeo.com/video/1029309810?background=1&autoplay=1&loop=1&muted=1&autopause=0&title=0&byline=0&portrait=0"
          className="w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Video Section"
        />
      </motion.div>
    </div>
  );
}

export default VideoSection;
