// components/hero/QuickActions.jsx
import React, { forwardRef } from "react";
import { Heart, Share, Eye } from "lucide-react";

const QuickActions = forwardRef(({ slide, isLiked, onLike, showEngagement }, ref) => {
  if (!slide) return null;

  return (
    <div ref={ref} className="flex gap-3 opacity-0">
      {/* Like Button - only for content slides */}
      {showEngagement && (
        <button
          onClick={onLike}
          className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isLiked 
              ? 'bg-red-500/20 text-red-400 border border-red-400/30' 
              : 'bg-black/20 text-white border border-white/20 hover:bg-white/10'
          }`}
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Share Button */}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: slide.title,
              text: slide.subtitle || slide.description,
              url: window.location.href,
            });
          } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
          }
        }}
        className="p-3 rounded-full backdrop-blur-sm bg-black/20 text-white border border-white/20 hover:bg-white/10 transition-all duration-300"
        aria-label="Share"
      >
        <Share className="w-5 h-5" />
      </button>

      {/* View Count - only for content slides */}
      {showEngagement && slide.engagementSummary && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm bg-black/20 text-white border border-white/20">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">
            {slide.engagementSummary.formatted.views}
          </span>
        </div>
      )}
    </div>
  );
});

QuickActions.displayName = "QuickActions";

export default QuickActions;
