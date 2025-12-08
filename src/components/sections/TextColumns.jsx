// components/sections/TextColumn.jsx
import { motion } from "framer-motion";
import AnimatedText from "./AnimatedText";
import TextContent from "./TextContent";
import ProductSlider from "../ProductSlider";

const TextColumn = ({
    products,
    isDesktop,
    textAnimationTriggered,
    invertLayout,
    title,
    description,
    textRef,
    textColor = "text-white",
}) => {
    const sliderVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                delay: 0.5,
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    // Define the reusable glassmorphic style string
//     const glassmorphicClasses = `
//     bg-white/2 
//     backdrop-blur-sm 
//     shadow-2xl 
//     rounded-2xl
//   `;

    return (
        <div
            className={`h-screen flex flex-col justify-around md:justify-between w-full md:w-1/2 pb-8 md:pt-24 ${invertLayout && isDesktop ? "items-end text-right" : "items-start text-left"
                }`}
            ref={textRef}
        >
            {/* Group Title and Text Content to control their overall spacing */}
            <div className="flex flex-col gap-4 w-full px-4 md:px-0">

                {/* --- Title with its own Glassmorphic Background --- */}
                {textAnimationTriggered && title && (
                    <div className={`p-4 md:p-6 `}>
                        <AnimatedText
                            text={title}
                            delay={0.05}
                            initialY={30}
                            initialOpacity={0}
                            animateOpacity={1}
                            className={`text-4xl md:text-6xl ${textColor}`}
                        />
                    </div>
                )}



            </div>

            {/* --- Mobile Product Slider with Entry Animation --- */}
            <motion.div
                className="md:hidden w-full"
                variants={sliderVariants}
                initial="hidden"
                animate={textAnimationTriggered ? "visible" : "hidden"}
            >
                <div className="pl-4">
                    <ProductSlider
                        products={products}
                        cardSize="sm"
                        gap={12}
                        showNavigation={false}
                        autoSlide={false}
                        autoSlideInterval={4000}
                        bg="white"
                    />
                </div>
            </motion.div>
            {/* --- Text Content and CTA with its own Glassmorphic Background --- */}
            <div className={`w-full p-4 md:p-6 `}>
                <TextContent
                    textAnimationTriggered={textAnimationTriggered}
                    description={description}
                    textColor={textColor}
                />
            </div>
        </div>
    );
};

export default TextColumn;
