// src/components/features/landing/feature-card.jsx
import { cn } from "@/lib/utils";

/**
 * Feature card component for landing page features section
 * @param {{ icon: React.ReactNode, title: string, description: string, className?: string }} props
 */
export default function FeatureCard({ icon, title, description, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
