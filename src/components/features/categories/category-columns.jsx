// /src/components/features/categories/category-columns.jsx
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
 * Category table columns configuration for TanStack Table
 * Defines column structure, sorting, and actions for category data display
 * @param {Function} onEdit - Callback function to trigger editing a category
 * @param {Function} onDelete - Callback function to trigger deleting a category
 * @returns {Array} Column definitions array
 */
export function createCategoryColumns(onEdit, onDelete) {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const category = row.original;
        return <div className="font-medium">{category.name}</div>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.original.description;
        return description ? (
          <div className="text-sm text-muted-foreground max-w-xs truncate">
            {description}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "_count.products",
      header: "Products",
      cell: ({ row }) => {
        const count = row.original._count?.products || 0;
        return (
          <div className="text-sm">
            {count} {count === 1 ? "product" : "products"}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        return (
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;

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
                onClick={() => onEdit(category.id)}
                className="flex items-center cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(category.id)}
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
