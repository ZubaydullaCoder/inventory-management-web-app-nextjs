// /src/components/features/products/product-data-table.jsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "@/components/ui/data-table";
import EmptyState from "@/components/ui/empty-state";
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
import { createProductColumns } from "@/components/features/products/product-columns";
import { Package } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import ProductEditModal from "./product-edit-modal";

/**
 * Fetches the list of products from the API.
 * @returns {Promise<Object>} The full paginated data object
 */
async function fetchProducts() {
  const response = await fetch("/api/products?limit=100");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  return data.data;
}

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
 * Client component to render the products data table.
 * It uses TanStack Query to manage and update the product list.
 * @param {{ initialProductsData: Object }} props
 * @returns {JSX.Element}
 */
export default function ProductDataTable({ initialProductsData }) {
  const queryClient = useQueryClient();
  const [editingProductId, setEditingProductId] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.list("products"),
    queryFn: fetchProducts,
    initialData: initialProductsData,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.list("products") });
      const previousProductsData = queryClient.getQueryData(
        queryKeys.list("products")
      );

      queryClient.setQueryData(queryKeys.list("products"), (oldData) => {
        if (!oldData || !oldData.products) return oldData;
        const filteredProducts = oldData.products.filter(
          (p) => p.id !== productId
        );
        return { ...oldData, products: filteredProducts };
      });

      return { previousProductsData };
    },
    onError: (err, productId, context) => {
      toast.error(err.message || "Failed to delete product");
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

  const products = productsData?.products || [];
  const columns = createProductColumns(setEditingProductId, (productId) => {
    const product = products.find((p) => p.id === productId);
    setDeletingProduct(product);
  });

  const handleDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id);
    }
  };

  if (isLoading && !initialProductsData) {
    return <div>Loading table...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error loading products. Please try refreshing.
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products yet"
        description="Start building your product catalog by adding your first product. You can add pricing, stock levels, and organize by categories."
        actionLabel="Add First Product"
        actionHref="/dashboard/inventory/products/new"
      />
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        filterKey="name"
        filterPlaceholder="Search products..."
      />
      {editingProductId && (
        <ProductEditModal
          productId={editingProductId}
          isOpen={!!editingProductId}
          onClose={() => setEditingProductId(null)}
        />
      )}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={() => setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This
              action cannot be undone. If this product has transaction history,
              the deletion will be blocked.
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
