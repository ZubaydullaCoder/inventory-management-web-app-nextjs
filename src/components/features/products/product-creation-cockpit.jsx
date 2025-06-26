// /src/components/features/products/product-creation-cockpit.jsx
"use client";

import { useState } from "react";
import ProductCreationForm from "@/components/features/products/product-creation-form";
import SessionCreationList from "@/components/features/products/product-session-creation-list";
import ProductEditModal from "@/components/features/products/product-edit-modal";

/**
 * Product creation cockpit client component
 * Manages state for creating and editing products within a session.
 * @returns {JSX.Element} Product creation cockpit with two-column layout
 */
export default function ProductCreationCockpit() {
  const [editingProduct, setEditingProduct] = useState(null);

  /**
   * Handles product edit request
   * Opens the standard edit modal
   * @param {Object} product - Product to edit
   */
  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
  };

  return (
    <>
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

      {/* Edit Modal */}
      {editingProduct && (
        <ProductEditModal
          productId={editingProduct.id}
          isOpen={!!editingProduct}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
