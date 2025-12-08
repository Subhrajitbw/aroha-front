// components/carousel/TabButton.jsx
export default function TabButton({ tab, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(tab)}
      className={`
        relative px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium tracking-wider uppercase 
        transition-all duration-300 ease-out rounded-full border backdrop-blur-sm
        transform-gpu will-change-transform
        ${
          isSelected
            ? "text-white bg-gradient-to-r from-amber-600 to-yellow-600 border-amber-500 shadow-lg shadow-amber-500/25 scale-105"
            : "text-gray-600 bg-white/90 border-gray-200 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/90 hover:scale-105"
        }
      `}
      style={{
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {tab}
      {isSelected && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 opacity-20 animate-pulse" />
      )}
    </button>
  );
}
