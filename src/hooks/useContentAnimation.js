import { useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

export const useContentAnimation = (inView, isDesktop) => {
  const contentControls = useAnimation();
  const desktopControls = useAnimation();
  const mobileSliderControls = useAnimation();

  const [desktopEntered, setDesktopEntered] = useState(false);
  const [textAnimationTriggered, setTextAnimationTriggered] = useState(false); // Track text animation state

  // ✅ First effect: handle content + setting desktopEntered
  useEffect(() => {

    if (inView) {
      contentControls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 1, ease: "easeOut" },
      }).then(() => {
        setDesktopEntered(true);
      });
    } else {
      setDesktopEntered(false);
      setTextAnimationTriggered(false);  // Reset the text animation trigger
      contentControls.set({ y: 100, opacity: 0 });
      desktopControls.stop();
      mobileSliderControls.stop();
    }
  }, [inView, isDesktop, contentControls]);

  // ✅ New effect: trigger slider animations only after desktopEntered is true
  useEffect(() => {

    if (!desktopEntered || !inView) {
      return;
    }

    if (isDesktop) {
      desktopControls.start({
        y: ["0%", "-50%"],
        transition: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear",
          delay: 2,
        },
      });
    } else {
      mobileSliderControls.start({
        x: ["0%", "-100%"],
        transition: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear",
          delay: 2,
        },
      });
    }
  }, [desktopEntered, isDesktop, inView, desktopControls, mobileSliderControls]);

  // ✅ New effect: Trigger text animation once contentControls animation is 90% done
  useEffect(() => {
    if (desktopEntered && !textAnimationTriggered) {
      setTextAnimationTriggered(true);
    }
  }, [desktopEntered, textAnimationTriggered]);

  return { contentControls, desktopControls, mobileSliderControls, desktopEntered, textAnimationTriggered };
};
