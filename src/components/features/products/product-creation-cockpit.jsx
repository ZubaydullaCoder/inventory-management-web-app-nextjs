// /src/components/features/products/product-creation-cockpit.jsx
"use client";

import { useState } from "react";
import ProductCreationForm from "@/components/features/products/product-creation-form";
import SessionCreationList from "@/components/features/products/session-creation-list";

/**
 * Product creation cockpit client component
 * Manages session state for bulk product creation workflow
 * @returns {JSX.Element} Product creation cockpit with two-column layout
 */
export default function ProductCreationCockpit() {
  // Session state for tracking created products
  const [sessionProducts, setSessionProducts] = useState([]);

  /**
   * Handles successful product creation
   * Adds new product to session list
   * @param {Object} product - Newly created product
   */
  const handleProductCreated = (product) => {
    setSessionProducts((prev) => [product, ...prev]);
  };

  /**
   * Handles product edit request
   * TODO: Implement edit modal in Part 4
   * @param {Object} product - Product to edit
   */
  const handleEditProduct = (product) => {
    console.log("Edit product:", product);
    // This will be implemented with intercepting route modal in Part 4
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Creation Form */}
      <div>
        <ProductCreationForm onProductCreated={handleProductCreated} />
      </div>

      {/* Right Column: Session Creation List */}
      <div>
        <SessionCreationList
          products={sessionProducts}
          onEditProduct={handleEditProduct}
        />
      </div>
    </div>
  );
}
