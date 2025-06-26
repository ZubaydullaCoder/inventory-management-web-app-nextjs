// /src/components/features/products/session-creation-list.jsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Deletes a product via API
 * @param {string} productId - Product ID to delete
 * @returns {Promise<Object>} Delete response
 */
async function deleteProduct(productId) {
  const response = await fetch(`/api/products/${productId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete product");
  }

  return await response.json();
}

/**
 * Product list item component for session creation list
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {Function} props.onEdit - Edit callback function
 * @param {Function} props.onDelete - Delete callback function
 * @returns {JSX.Element} Product list item
 */
function ProductListItem({ product, onEdit, onDelete }) {
  const isOptimistic = product.id.toString().startsWith("optimistic-");
  const isUpdating = !!product.isUpdating;

  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
        isOptimistic || isUpdating
          ? "bg-blue-50 border-blue-200 animate-pulse"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex-1">
        <h4
          className={`font-medium ${
            isOptimistic || isUpdating ? "text-blue-900" : "text-gray-900"
          }`}
        >
          {product.name}
          {(isOptimistic || isUpdating) && (
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

      <div className="flex items-center space-x-2 ml-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(product)}
          disabled={isOptimistic || isUpdating}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product)}
          disabled={isOptimistic || isUpdating}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
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
  const queryClient = useQueryClient();
  const [deletingProduct, setDeletingProduct] = useState(null);

  const { data: products = [] } = useQuery({
    queryKey: queryKeys.session("products"),
    queryFn: () => {
      return [];
    },
    staleTime: Infinity,
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (productId) => {
      await queryClient.cancelQueries();
      const previousSessionProducts = queryClient.getQueryData(
        queryKeys.session("products")
      );
      const previousProductsData = queryClient.getQueryData(
        queryKeys.list("products")
      );

      // Remove from session list
      queryClient.setQueryData(queryKeys.session("products"), (old) => {
        if (!old) return [];
        return old.filter((p) => p.id !== productId);
      });

      // Remove from main products list
      queryClient.setQueryData(queryKeys.list("products"), (oldData) => {
        if (!oldData || !oldData.products) return oldData;
        const filteredProducts = oldData.products.filter(
          (p) => p.id !== productId
        );
        return { ...oldData, products: filteredProducts };
      });

      return { previousSessionProducts, previousProductsData };
    },
    onError: (err, productId, context) => {
      toast.error(err.message || "Failed to delete product");
      if (context?.previousSessionProducts) {
        queryClient.setQueryData(
          queryKeys.session("products"),
          context.previousSessionProducts
        );
      }
      if (context?.previousProductsData) {
        queryClient.setQueryData(
          queryKeys.list("products"),
          context.previousProductsData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list("products") });
      setDeletingProduct(null);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully!");
    },
  });

  const handleDelete = () => {
    if (deletingProduct) {
      // Check if it's an optimistic product (not yet saved to server)
      if (deletingProduct.id.toString().startsWith("optimistic-")) {
        // Just remove from session cache for optimistic products
        queryClient.setQueryData(queryKeys.session("products"), (old) => {
          if (!old) return [];
          return old.filter((p) => p.id !== deletingProduct.id);
        });
        toast.success("Product removed from session!");
        setDeletingProduct(null);
      } else {
        // Delete from server for real products
        deleteMutation.mutate(deletingProduct.id);
      }
    }
  };

  return (
    <>
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
                  onDelete={setDeletingProduct}
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

      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={() => setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"?{" "}
              {deletingProduct?.id.toString().startsWith("optimistic-")
                ? "This will remove it from the current session."
                : "This action cannot be undone. If this product has transaction history, the deletion will be blocked."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
