// components/sections/TextContent.jsx
import { motion } from "framer-motion";
import AnimatedText from "./AnimatedText";
import CTAButton from "./CTAButton";

const TextContent = ({ textAnimationTriggered, description }) => {
  if (!textAnimationTriggered || !description) return null;

  return (
    <div className="items-start px-4 md:px-0 flex flex-col space-y-1 md:space-y-6 sm:w-full md:w-1/2">
      <AnimatedText
        text={description}
        delay={0.02}
        initialY={30}
        initialOpacity={0}
        animateOpacity={1}
        className="text-sm md:text-lg"
      />
      
      <motion.div
        className="w-full"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
      >
        <CTAButton />
      </motion.div>
    </div>
  );
};

export default TextContent;
