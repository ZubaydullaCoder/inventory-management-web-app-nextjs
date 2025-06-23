// src/components/ui/primary-button.jsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Primary branded button component following design system
 * @param {{ children: React.ReactNode, className?: string, variant?: 'default' | 'outline', [key: string]: any }} props
 */
export default function PrimaryButton({
  children,
  className,
  variant = "default",
  ...props
}) {
  return (
    <Button
      className={cn(
        "bg-primary hover:bg-primary/90 text-primary-foreground font-medium",
        variant === "outline" &&
          "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
