// components/PriceRangeSlider.jsx
import { useState, useEffect } from "react";

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1000,
}) {
  const [localMin, setLocalMin] = useState(value[0] ?? min);
  const [localMax, setLocalMax] = useState(value[1] ?? max);

  useEffect(() => {
    setLocalMin(value[0] ?? min);
    setLocalMax(value[1] ?? max);
  }, [value[0], value[1], min, max]);

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value) || 0, localMax);
    setLocalMin(newMin);
    onChange([newMin, localMax]);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value) || 0, localMin);
    setLocalMax(newMax);
    onChange([localMin, newMax]);
  };

  return (
    <div className="space-y-3">
      {/* Visual Slider Track and Thumbs */}
      <div className="relative h-px bg-stone-200 mt-6 mb-4 w-full">
        <style>{`
          .custom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ffffff;
            border: 1px solid #1c1917;
            cursor: pointer;
            pointer-events: auto;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          .custom-slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ffffff;
            border: 1px solid #1c1917;
            cursor: pointer;
            pointer-events: auto;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
        `}</style>

        {/* Active Track Highlight */}
        <div 
          className="absolute h-full bg-stone-900"
          style={{ 
            left: `${((localMin - min) / (max - min || 1)) * 100}%`, 
            right: `${100 - ((localMax - min) / (max - min || 1)) * 100}%` 
          }}
        />
        {/* Min Thumb */}
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          className="custom-slider absolute -top-1.5 w-full h-4 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: localMin > max - 100 ? 5 : 3 }}
        />
        {/* Max Thumb */}
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          className="custom-slider absolute -top-1.5 w-full h-4 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Numeric inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
            ₹
          </div>
          <input
            type="number"
            value={localMin}
            onChange={handleMinChange}
            className="w-full pl-7 pr-3 py-2 text-xs border border-stone-200 bg-white/90 rounded-none focus:outline-none focus:border-stone-900 font-light transition-all duration-200"
          />
        </div>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
            ₹
          </div>
          <input
            type="number"
            value={localMax}
            onChange={handleMaxChange}
            className="w-full pl-7 pr-3 py-2 text-xs border border-stone-200 bg-white/90 rounded-none focus:outline-none focus:border-stone-900 font-light transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}
