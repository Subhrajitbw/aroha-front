
// components/carousel/CTASection.jsx
import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = forwardRef(({ linkState }, ref) => {
  return (
    <div ref={ref} className="text-center opacity-0">
      <Link
        to="/shop"
        state={linkState}
        className="group inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1 md:py-3 text-xs md:text-sm font-medium text-amber-700 bg-white/90 backdrop-blur-sm hover:bg-amber-50 hover:border-amber-300 transition-all duration-300  transform-gpu hover:scale-105"
      >
        <span className="tracking-wide">Explore Collection</span>
        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
});

CTASection.displayName = "CTASection";
export default CTASection;
