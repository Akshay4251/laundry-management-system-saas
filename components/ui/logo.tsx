import { Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-xl", container: "p-2" },
    md: { icon: "h-8 w-8", text: "text-2xl", container: "p-2.5" },
    lg: { icon: "h-10 w-10", text: "text-3xl", container: "p-3" },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
        
        {/* Icon container */}
        <div className={`relative bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-600 ${currentSize.container} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Sparkles className={`${currentSize.icon} text-white`} strokeWidth={2.5} />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent tracking-tight`}>
            LaundryPro
          </span>
          <span className="text-xs text-gray-500 font-medium -mt-1">Smart Management</span>
        </div>
      )}
    </div>
  );
};