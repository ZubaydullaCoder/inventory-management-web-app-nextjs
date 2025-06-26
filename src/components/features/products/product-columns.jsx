// /src/components/features/products/product-columns.jsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

/**
 * Product table columns configuration for TanStack Table
 * Defines column structure, sorting, and actions for product data display
 * @param {Function} onEdit - Callback function to trigger editing a product
 * @param {Function} onDelete - Callback function to trigger deleting a product
 * @returns {Array} Column definitions array
 */
export function createProductColumns(onEdit, onDelete) {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="font-medium">
            {product.name}
            {product.sku && (
              <div className="text-sm text-muted-foreground">
                SKU: {product.sku}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? category.name : "—";
      },
      enableSorting: false,
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => {
        const supplier = row.original.supplier;
        return supplier ? supplier.name : "—";
      },
      enableSorting: false,
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("sellingPrice"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("stock");
        const reorderPoint = row.original.reorderPoint || 0;
        const isLowStock = stock <= reorderPoint;

        return (
          <div className={`font-medium ${isLowStock ? "text-red-600" : ""}`}>
            {stock}
            {isLowStock && (
              <div className="text-xs text-red-500">Low Stock</div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onEdit(product.id)}
                className="flex items-center cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(product.id)}
                className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
