import * as React from "react";
import { cn } from "@/lib/utils";

export interface CodeverseInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  glowColor?: "primary" | "secondary" | "accent";
}

const CodeverseInput = React.forwardRef<HTMLInputElement, CodeverseInputProps>(
  ({ className, type, glowColor = "primary", ...props }, ref) => {
    const glowStyles = {
      primary: "focus:border-primary/50 focus:shadow-[0_0_20px_hsla(348,100%,50%,0.3)]",
      secondary: "focus:border-secondary/50 focus:shadow-[0_0_20px_hsla(185,100%,50%,0.3)]",
      accent: "focus:border-accent/50 focus:shadow-[0_0_20px_hsla(270,80%,60%,0.3)]",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-lg font-mono text-foreground placeholder:text-muted-foreground transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm",
          glowStyles[glowColor],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
CodeverseInput.displayName = "CodeverseInput";

export { CodeverseInput };