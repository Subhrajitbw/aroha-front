// components/hero/HeroContent.jsx
import React, { forwardRef } from "react";

const HeroContent = ({ refs, slide, activeSlide, onActionClick, textAlign = "left" }) => {
  if (!slide) return null;

  const textAlignClass = {
    left: "text-left",
    center: "text-center", 
    right: "text-right"
  }[textAlign] || "text-left";

  return (
    <div ref={refs.contentBox} className={`space-y-6 max-w-3xl ${textAlignClass}`}>
      {/* Accent Text */}
      {slide.accent && (
        <div ref={refs.accent} className="opacity-0">
          <span className="text-sm font-medium tracking-wider uppercase text-gray-300">
            {slide.accent}
          </span>
        </div>
      )}

      {/* Main Headline */}
      <h1 
        ref={refs.headline} 
        className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight opacity-0"
      >
        {slide.title}
      </h1>

      {/* Subtitle */}
      {slide.subtitle && (
        <h2 className="text-xl md:text-2xl font-medium text-gray-200 opacity-0">
          {slide.subtitle}
        </h2>
      )}

      {/* Description */}
      {slide.description && (
        <p 
          ref={refs.subText} 
          className="text-lg leading-relaxed text-gray-300 opacity-0 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: slide.description }}
        />
      )}

      {/* Metadata Row */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
        {slide.category && (
          <span className="flex items-center gap-1">
            📂 {slide.category}
          </span>
        )}
        
        {slide.metadata?.year && (
          <span className="flex items-center gap-1">
            📅 {slide.metadata.year}
          </span>
        )}

        {slide.formattedPrice && (
          <span className="flex items-center gap-1 text-green-400 font-medium">
            💰 {slide.formattedPrice}
          </span>
        )}

        {slide.engagementSummary && (
          <>
            <span className="flex items-center gap-1">
              👀 {slide.engagementSummary.formatted.views}
            </span>
            <span className="flex items-center gap-1">
              ❤️ {slide.engagementSummary.formatted.likes}
            </span>
          </>
        )}
      </div>

      {/* Call-to-Action Buttons */}
      {slide.actions && slide.actions.length > 0 && (
        <div ref={refs.cta} className="flex flex-wrap gap-4 opacity-0">
          {slide.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => onActionClick(action, slide.id)}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105
                ${action.style === 'primary' ? 'bg-white text-black hover:bg-gray-200' :
                  action.style === 'secondary' ? 'bg-gray-800 text-white hover:bg-gray-700' :
                  action.style === 'outline' ? 'border-2 border-white text-white hover:bg-white hover:text-black' :
                  'text-white hover:bg-white/10'
                }
              `}
            >
              {action.text}
              {action.icon && <span className="ml-2">{action.icon}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroContent;
