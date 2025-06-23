// /src/components/features/dashboard/onboarding-guide.jsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Tags,
  Truck,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

/**
 * Onboarding step configuration
 * @typedef {Object} OnboardingStep
 * @property {string} id - Unique step identifier
 * @property {string} title - Step display title
 * @property {string} description - Step description
 * @property {React.ComponentType} icon - Lucide icon component
 * @property {string} href - Navigation link for the step
 * @property {string} buttonText - Call-to-action button text
 * @property {boolean} completed - Whether step is completed
 */

/**
 * Onboarding steps configuration for new users
 * @type {OnboardingStep[]}
 */
const onboardingSteps = [
  {
    id: "categories",
    title: "Set Up Categories",
    description:
      "Organize your products by creating categories like 'Electronics', 'Clothing', etc.",
    icon: Tags,
    href: "/dashboard/inventory/categories/new",
    buttonText: "Add Categories",
    completed: false,
  },
  {
    id: "suppliers",
    title: "Add Suppliers",
    description:
      "Register your suppliers to track where you purchase your inventory from.",
    icon: Truck,
    href: "/dashboard/suppliers/new",
    buttonText: "Add Suppliers",
    completed: false,
  },
  {
    id: "customers",
    title: "Register Customers",
    description:
      "Add your regular customers to track sales and manage accounts receivable.",
    icon: Users,
    href: "/dashboard/customers/new",
    buttonText: "Add Customers",
    completed: false,
  },
  {
    id: "products",
    title: "Create Product Catalog",
    description:
      "Build your product inventory with prices, stock levels, and details.",
    icon: Package,
    href: "/dashboard/inventory/products/new",
    buttonText: "Add Products",
    completed: false,
  },
];

/**
 * Individual onboarding step card component
 * @param {Object} props - Component props
 * @param {OnboardingStep} props.step - The onboarding step data
 * @param {number} props.stepNumber - Display number for the step
 * @returns {JSX.Element} Onboarding step card
 */
function OnboardingStepCard({ step, stepNumber }) {
  const { title, description, icon: Icon, href, buttonText, completed } = step;

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        completed ? "border-green-200 bg-green-50" : "border-gray-200"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              completed
                ? "bg-green-100 text-green-700"
                : "bg-primary/10 text-primary"
            }`}
          >
            {completed ? <CheckCircle className="w-5 h-5" /> : stepNumber}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Icon
            className={`w-6 h-6 ${
              completed ? "text-green-600" : "text-gray-400"
            }`}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>

        <Button asChild className="w-full">
          <Link href={href} className="flex items-center justify-center">
            {buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Onboarding guide component for new users
 * Displays step-by-step checklist to guide initial data setup
 * @returns {JSX.Element} Onboarding guide with navigation steps
 */
export default function OnboardingGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Your Inventory Manager! 🎉
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Let's get your business set up in just a few steps. We'll guide you
          through creating the essential data you need to start managing your
          inventory effectively.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Package className="w-5 h-5 mr-2" />
            Getting Started Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Complete these steps to set up your business foundation. You can
            always come back and add more data later!
          </p>
        </CardContent>
      </Card>

      {/* Onboarding Steps Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {onboardingSteps.map((step, index) => (
          <OnboardingStepCard
            key={step.id}
            step={step}
            stepNumber={index + 1}
          />
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2">
            <li>• Start with a few categories and expand as needed</li>
            <li>• Add your most important suppliers and customers first</li>
            <li>
              • You can bulk-create products using our efficient "Cockpit"
              interface
            </li>
            <li>
              • Each step saves automatically - no need to worry about losing
              data
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
