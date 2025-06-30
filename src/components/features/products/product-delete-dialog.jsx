// /src/components/features/products/product-delete-dialog.jsx
"use client";

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

/**
 * Product delete confirmation dialog
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Function} props.onClose - Callback to close dialog
 * @param {Function} props.onConfirm - Callback when delete is confirmed
 * @param {boolean} [props.isPending=false] - Whether the confirm action is pending
 * @param {string} props.productName - Name of product to delete
 * @returns {JSX.Element} Delete confirmation dialog
 */
export default function ProductDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
  productName,
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{productName}"? This action cannot
            be undone. If this product has transaction history, the deletion
            will be blocked.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete Product"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
