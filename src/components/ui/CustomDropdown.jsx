import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

function CustomDropdown({ label, options = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.label === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-[11px] uppercase tracking-[0.2em] font-black text-stone-900 mb-3">
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-stone-200 bg-white text-left transition-all duration-300 hover:border-stone-400"
      >
        <div className="flex flex-col">
          <span className="text-[12px] font-semibold text-stone-900 uppercase tracking-wider">
            {selectedOption ? selectedOption.label : "Select option"}
          </span>
          {selectedOption?.description && (
            <span className="text-[10px] text-stone-400 font-light mt-1">
              {selectedOption.description}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-stone-500 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute z-50 mt-3 w-full rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-300 origin-top ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="max-h-60 overflow-y-auto p-2">
          {options.map((opt) => {
            const isSelected = value === opt.label;

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  onChange(opt.label);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex justify-between items-start ${
                  isSelected
                    ? "bg-stone-900 text-white"
                    : "hover:bg-stone-100 text-stone-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider font-bold">
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span
                      className={`text-[9px] mt-1 ${
                        isSelected ? "text-stone-300" : "text-stone-400"
                      }`}
                    >
                      {opt.description}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 mt-1 animate-in zoom-in duration-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default CustomDropdown;