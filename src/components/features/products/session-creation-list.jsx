// /src/components/features/products/session-creation-list.jsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Product list item component for session creation list
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {Function} props.onEdit - Edit callback function
 * @returns {JSX.Element} Product list item
 */
function ProductListItem({ product, onEdit }) {
  const isOptimistic = product.id.toString().startsWith("optimistic-");

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
        isOptimistic
          ? "bg-blue-50 border-blue-200 animate-pulse"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex-1">
        <h4
          className={`font-medium ${
            isOptimistic ? "text-blue-900" : "text-gray-900"
          }`}
        >
          {product.name}
          {isOptimistic && (
            <span className="text-xs ml-2 text-blue-600">(saving...)</span>
          )}
        </h4>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
          <span>${product.sellingPrice.toFixed(2)}</span>
          {product.sku && <span>SKU: {product.sku}</span>}
          <span>Stock: {product.stock}</span>
        </div>
        {product.description && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            {product.description}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(product)}
        className="ml-3"
        disabled={isOptimistic}
      >
        <Edit className="w-4 h-4" />
      </Button>
    </div>
  );
}

/**
 * Session creation list component using TanStack Query
 * Displays products created in the current session from the query cache
 * @param {Object} props - Component props
 * @param {Function} props.onEditProduct - Edit product callback
 * @returns {JSX.Element} Session creation list
 */
export default function SessionCreationList({ onEditProduct }) {
  // Fetch session products from TanStack Query cache
  const { data: products = [] } = useQuery({
    queryKey: queryKeys.session("products"),
    queryFn: () => {
      // This returns the current cache data or empty array
      // The actual data is managed by optimistic updates in the form
      return [];
    },
    staleTime: Infinity, // Session data doesn't need refetching
    initialData: [], // Start with empty array
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Products Added This Session
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({products.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No products added yet</p>
            <p className="text-xs mt-1">
              Products you create will appear here instantly
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <ProductListItem
                key={product.id}
                product={product}
                onEdit={onEditProduct}
              />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full" asChild>
              <a href="/dashboard/inventory/products">
                Save and Finish ({products.length} products)
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
