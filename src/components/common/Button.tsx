import { ButtonHTMLAttributes } from "react";
import { cn } from "@/helpers/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({ 
  children, 
  className, 
  variant = "primary",
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        variant === "primary" 
          ? "text-white bg-white/10 hover:bg-white/20" 
          : "bg-white/90 hover:bg-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}