import { LucideIcon } from "lucide-react";

interface ImagePlaceholderProps {
  icon: LucideIcon;
  gradient: string;
  pattern?: "dots" | "grid" | "waves";
  children?: React.ReactNode;
}

export const ImagePlaceholder = ({ 
  icon: Icon, 
  gradient, 
  pattern = "grid",
  children 
}: ImagePlaceholderProps) => {
  const patterns = {
    dots: "bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]",
    grid: "bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:20px_20px]",
    waves: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgMjAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZjIwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]",
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} p-8 lg:p-12 h-full min-h-[400px] flex items-center justify-center`}>
      {/* Pattern Overlay */}
      <div className={`absolute inset-0 ${patterns[pattern]}`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Floating Icon */}
      <div className="absolute bottom-8 right-8 opacity-10">
        <Icon className="w-32 h-32" strokeWidth={1.5} />
      </div>
    </div>
  );
};