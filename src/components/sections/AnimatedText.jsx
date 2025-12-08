
import { motion } from "framer-motion";

const AnimatedText = ({
  text,
  delay = 0.5,
  initialY = 10,
  className = "",
  initialOpacity = 0,
  animateOpacity = 1,
  tag: Tag = "div", // default wrapper tag
}) => {
  return (
    <Tag
    className={`px-4 md:px-0 text-white font-heading-large flex flex-wrap text-left ${className}`}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: initialOpacity, y: initialY }}
          animate={{ opacity: animateOpacity, y: 0 }}
          transition={{ delay: i * delay }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </Tag>
  );
};

export default AnimatedText;
