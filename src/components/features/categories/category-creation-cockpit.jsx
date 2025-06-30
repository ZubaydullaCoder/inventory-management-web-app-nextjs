// /src/components/features/categories/category-creation-cockpit.jsx
"use client";

import { useState } from "react";
import CategoryCreationForm from "@/components/features/categories/category-creation-form";
import CategorySessionCreationList from "@/components/features/categories/category-session-creation-list";
import CategoryEditModal from "@/components/features/categories/category-edit-modal";

/**
 * Category creation cockpit client component
 * Manages state for creating and editing categories within a session.
 * @returns {JSX.Element} Category creation cockpit with two-column layout
 */
export default function CategoryCreationCockpit() {
  const [editingCategory, setEditingCategory] = useState(null);

  /**
   * Handles category edit request
   * Opens the standard edit modal
   * @param {Object} category - Category to edit
   */
  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Creation Form */}
        <div>
          <CategoryCreationForm />
        </div>

        {/* Right Column: Session Creation List */}
        <div>
          <CategorySessionCreationList onEditCategory={handleEditCategory} />
        </div>
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <CategoryEditModal
          categoryId={editingCategory.id}
          isOpen={!!editingCategory}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
