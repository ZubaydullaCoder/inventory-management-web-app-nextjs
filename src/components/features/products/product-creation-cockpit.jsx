// /src/components/features/products/product-creation-cockpit.jsx
"use client";

import ProductCreationForm from "@/components/features/products/product-creation-form";
import SessionCreationList from "@/components/features/products/session-creation-list";

/**
 * Product creation cockpit client component
 * Now uses TanStack Query for state management instead of local state
 * @returns {JSX.Element} Product creation cockpit with two-column layout
 */
export default function ProductCreationCockpit() {
  /**
   * Handles product edit request
   * Opens intercepting route modal for editing
   * @param {Object} product - Product to edit
   */
  const handleEditProduct = (product) => {
    // Navigate to edit modal (intercepting route will handle this)
    window.location.href = `/dashboard/inventory/products/${product.id}/edit`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Creation Form */}
      <div>
        <ProductCreationForm />
      </div>

      {/* Right Column: Session Creation List */}
      <div>
        <SessionCreationList onEditProduct={handleEditProduct} />
      </div>
    </div>
  );
}
