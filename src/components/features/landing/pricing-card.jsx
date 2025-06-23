// src/components/features/landing/pricing-card.jsx
import Link from "next/link";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PrimaryButton from "@/components/ui/primary-button";
import { cn } from "@/lib/utils";

/**
 * Pricing card component for subscription plans
 * @param {{
 *   title: string,
 *   price: string,
 *   description: string,
 *   features: string[],
 *   isPopular?: boolean,
 *   buttonText?: string,
 *   buttonHref?: string
 * }} props
 */
export default function PricingCard({
  title,
  price,
  description,
  features,
  isPopular = false,
  buttonText = "Get Started",
  buttonHref = "/login",
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        isPopular && "border-primary shadow-lg scale-105"
      )}
    >
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
          Most Popular
        </div>
      )}

      <CardHeader className={cn(isPopular && "pt-8")}>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground text-sm">/month</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Link href={buttonHref} className="w-full">
          <PrimaryButton
            className="w-full"
            variant={isPopular ? "default" : "outline"}
          >
            {buttonText}
          </PrimaryButton>
        </Link>
      </CardFooter>
    </Card>
  );
}
