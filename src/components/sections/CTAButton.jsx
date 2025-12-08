// components/ui/CTAButton.jsx
import { MoveRight } from "lucide-react";

const CTAButton = ({ 
  text = "Shop Now", 
  onClick,
  className = "",
  variant = "primary" 
}) => {
  const baseStyles = "flex items-center justify-center gap-4 font-bold py-2 px-4 rounded shadow-lg transition duration-200 w-full";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200",
    secondary: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black",
    accent: "bg-blue-600 text-white hover:bg-blue-700"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      <span>{text}</span>
      <MoveRight className="w-6 h-6" />
    </button>
  );
};

export default CTAButton;
