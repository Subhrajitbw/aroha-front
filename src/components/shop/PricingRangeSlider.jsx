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
      {/* Track and thumbs */}
       

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
            className="w-full pl-7 pr-3 py-2.5 text-xs border border-stone-200/60 bg-white/90 rounded-lg
                       focus:outline-none focus:ring-1 focus:ring-stone-500/20 focus:border-stone-500/60
                       transition-all duration-200"
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
            className="w-full pl-7 pr-3 py-2.5 text-xs border border-stone-200/60 bg-white/90 rounded-lg
                       focus:outline-none focus:ring-1 focus:ring-stone-500/20 focus:border-stone-500/60
                       transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}
