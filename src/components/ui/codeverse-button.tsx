import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const codeverseButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-semibold tracking-wider uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary to-codeverse-erevos-glow text-primary-foreground border border-primary/50 hover:shadow-[0_0_30px_hsla(348,100%,50%,0.5)] hover:scale-105 active:scale-95",
        secondary:
          "bg-gradient-to-r from-secondary/20 to-codeverse-cyan/20 text-secondary border border-secondary/50 hover:bg-secondary/30 hover:shadow-[0_0_30px_hsla(185,100%,50%,0.4)]",
        violet:
          "bg-gradient-to-r from-accent/20 to-codeverse-violet/20 text-accent border border-accent/50 hover:bg-accent/30 hover:shadow-[0_0_30px_hsla(270,80%,60%,0.4)]",
        ghost:
          "text-foreground/70 hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border",
        locked:
          "bg-muted/30 text-muted-foreground border border-muted cursor-not-allowed opacity-60",
        destructive:
          "bg-destructive/20 text-destructive border border-destructive/50 hover:bg-destructive/30",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-md",
        default: "h-11 px-6 text-sm rounded-lg",
        lg: "h-14 px-8 text-base rounded-lg",
        xl: "h-16 px-10 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface CodeverseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof codeverseButtonVariants> {
  asChild?: boolean;
}

const CodeverseButton = React.forwardRef<HTMLButtonElement, CodeverseButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(codeverseButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
CodeverseButton.displayName = "CodeverseButton";

export { CodeverseButton, codeverseButtonVariants };