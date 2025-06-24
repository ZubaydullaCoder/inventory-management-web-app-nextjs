// /src/components/features/categories/category-session-creation-list.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Category list item component for session creation list
 * @param {Object} props - Component props
 * @param {Object} props.category - Category data
 * @param {Function} props.onEdit - Edit callback function
 * @returns {JSX.Element} Category list item
 */
function CategoryListItem({ category, onEdit }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{category.name}</h4>
        {category.description && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            {category.description}
          </p>
        )}
        <div className="text-xs text-gray-400 mt-1">
          {category._count?.products || 0} products
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(category)}
        className="ml-3"
      >
        <Edit className="w-4 h-4" />
      </Button>
    </div>
  );
}

/**
 * Category session creation list component
 * Displays categories created in the current session
 * @param {Object} props - Component props
 * @param {Array} props.categories - Array of categories created in session
 * @param {Function} props.onEditCategory - Edit category callback
 * @returns {JSX.Element} Session creation list
 */
export default function CategorySessionCreationList({
  categories,
  onEditCategory,
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tags className="w-5 h-5 mr-2" />
          Categories Added This Session
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({categories.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tags className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No categories added yet</p>
            <p className="text-xs mt-1">
              Categories you create will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <CategoryListItem
                key={category.id}
                category={category}
                onEdit={onEditCategory}
              />
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full" asChild>
              <a href="/dashboard/inventory/categories">
                Save and Finish ({categories.length} categories)
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
