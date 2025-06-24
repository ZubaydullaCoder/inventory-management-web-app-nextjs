// /src/components/features/products/session-creation-list.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Product list item component for session creation list
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {Function} props.onEdit - Edit callback function
 * @returns {JSX.Element} Product list item
 */
function ProductListItem({ product, onEdit }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{product.name}</h4>
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
      >
        <Edit className="w-4 h-4" />
      </Button>
    </div>
  );
}

/**
 * Session creation list component
 * Displays products created in the current session
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of products created in session
 * @param {Function} props.onEditProduct - Edit product callback
 * @returns {JSX.Element} Session creation list
 */
export default function SessionCreationList({ products, onEditProduct }) {
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
            <p className="text-xs mt-1">Products you create will appear here</p>
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
