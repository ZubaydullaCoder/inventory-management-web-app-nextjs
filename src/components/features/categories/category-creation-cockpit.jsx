// /src/components/features/categories/category-creation-cockpit.jsx
"use client";

import { useState } from "react";
import CategoryCreationForm from "@/components/features/categories/category-creation-form";
import CategorySessionCreationList from "@/components/features/categories/category-session-creation-list";

/**
 * Category creation cockpit client component
 * Manages session state for bulk category creation workflow
 * @returns {JSX.Element} Category creation cockpit with two-column layout
 */
export default function CategoryCreationCockpit() {
  // Session state for tracking created categories
  const [sessionCategories, setSessionCategories] = useState([]);

  /**
   * Handles successful category creation
   * Adds new category to session list
   * @param {Object} category - Newly created category
   */
  const handleCategoryCreated = (category) => {
    setSessionCategories((prev) => [category, ...prev]);
  };

  /**
   * Handles category edit request
   * TODO: Implement edit modal in intercepting route
   * @param {Object} category - Category to edit
   */
  const handleEditCategory = (category) => {
    console.log("Edit category:", category);
    // This will be implemented with intercepting route modal
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Creation Form */}
      <div>
        <CategoryCreationForm onCategoryCreated={handleCategoryCreated} />
      </div>

      {/* Right Column: Session Creation List */}
      <div>
        <CategorySessionCreationList
          categories={sessionCategories}
          onEditCategory={handleEditCategory}
        />
      </div>
    </div>
  );
}
