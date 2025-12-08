
// components/sections/BackgroundSection.jsx
import { animated } from "@react-spring/web";
import { useBackgroundSpring } from "../../hooks/useBackgroundSpring";
import { useRef } from "react";

const BackgroundSection = ({ background, children, className = "" }) => {
    console.log("background",background)
  const sectionRef = useRef(null);
  const bgSpring = useBackgroundSpring(sectionRef);

  return (
    <animated.div
      ref={sectionRef}
      style={{
        ...bgSpring,
        backgroundImage: `url(${background||'https://media.designcafe.com/wp-content/uploads/2022/08/04164549/brown-leather-reading-chair.jpg'})` : '',
        backgroundAttachment:
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
            ? "scroll"
            : "fixed",
        backgroundRepeat: "no-repeat",
      }}
      className={`w-full min-h-0 h-full overflow-auto ${className}`}
    >
      <div className="w-full h-full min-h-0 bg-black/40 flex items-center justify-center overflow-auto">
        {children}
      </div>
    </animated.div>
  );
};

export default BackgroundSection;
