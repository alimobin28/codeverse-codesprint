import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const codeverseCardVariants = cva(
  "relative rounded-xl border backdrop-blur-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-card/80 border-border hover:border-primary/30 hover:shadow-[0_0_30px_hsla(348,100%,50%,0.15)]",
        elevated:
          "bg-card/90 border-border shadow-lg hover:shadow-[0_0_40px_hsla(348,100%,50%,0.2)]",
        locked:
          "bg-muted/20 border-muted/50 opacity-70 cursor-not-allowed",
        active:
          "bg-card/90 border-primary/50 shadow-[0_0_30px_hsla(348,100%,50%,0.3)]",
        cyan:
          "bg-card/80 border-secondary/30 hover:border-secondary/50 hover:shadow-[0_0_30px_hsla(185,100%,50%,0.15)]",
        violet:
          "bg-card/80 border-accent/30 hover:border-accent/50 hover:shadow-[0_0_30px_hsla(270,80%,60%,0.15)]",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CodeverseCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof codeverseCardVariants> {
  locked?: boolean;
  lockedMessage?: string;
}

const CodeverseCard = React.forwardRef<HTMLDivElement, CodeverseCardProps>(
  ({ className, variant, size, locked, lockedMessage, children, ...props }, ref) => {
    const finalVariant = locked ? "locked" : variant;

    return (
      <motion.div
        ref={ref}
        className={cn(codeverseCardVariants({ variant: finalVariant, size, className }))}
        whileHover={!locked ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.2 }}
        {...(props as any)}
      >
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-background/50 rounded-xl backdrop-blur-sm">
            <Lock className="w-8 h-8 text-muted-foreground animate-pulse" />
            <span className="text-sm text-muted-foreground font-mono">
              {lockedMessage || "Awaiting System Authorization"}
            </span>
          </div>
        )}
        <div className={locked ? "opacity-30 pointer-events-none" : ""}>
          {children}
        </div>
      </motion.div>
    );
  }
);
CodeverseCard.displayName = "CodeverseCard";

const CodeverseCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 mb-4", className)}
    {...props}
  />
));
CodeverseCardHeader.displayName = "CodeverseCardHeader";

const CodeverseCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display text-xl font-semibold tracking-wide", className)}
    {...props}
  />
));
CodeverseCardTitle.displayName = "CodeverseCardTitle";

const CodeverseCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground font-mono", className)}
    {...props}
  />
));
CodeverseCardDescription.displayName = "CodeverseCardDescription";

const CodeverseCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CodeverseCardContent.displayName = "CodeverseCardContent";

export {
  CodeverseCard,
  CodeverseCardHeader,
  CodeverseCardTitle,
  CodeverseCardDescription,
  CodeverseCardContent,
  codeverseCardVariants,
};