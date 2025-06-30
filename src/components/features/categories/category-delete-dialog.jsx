// /src/components/features/categories/category-delete-dialog.jsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Category delete confirmation dialog
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Function} props.onConfirm - Function to confirm deletion
 * @param {string} props.categoryName - Name of the category to delete
 * @param {number} props.productCount - Number of products in this category
 * @param {boolean} props.isPending - Whether the deletion is in progress
 * @returns {JSX.Element} Delete confirmation dialog
 */
export default function CategoryDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  productCount = 0,
  isPending,
}) {
  const hasProducts = productCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Category
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to delete the category{" "}
                <span className="font-medium">"{categoryName}"</span>?
              </p>
              {hasProducts && (
                <p className="text-red-600 font-medium">
                  Warning: This category contains {productCount}{" "}
                  {productCount === 1 ? "product" : "products"}. You must
                  reassign or delete those products first before deleting this
                  category.
                </p>
              )}
              {!hasProducts && <p>This action cannot be undone.</p>}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending || hasProducts}
          >
            {isPending ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
