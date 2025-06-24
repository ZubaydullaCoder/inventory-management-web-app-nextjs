// /src/app/(dashboard)/dashboard/inventory/categories/@modal/(..)categories/[id]/edit/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Category edit form validation schema
 */
const EditCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().optional(),
});

/**
 * Fetches a single category by ID
 * @param {string} categoryId - Category ID to fetch
 * @returns {Promise<Object>} Category data
 */
async function fetchCategory(categoryId) {
  const response = await fetch(`/api/categories/${categoryId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch category");
  }
  const data = await response.json();
  return data.data;
}

/**
 * Updates a category via API
 * @param {string} categoryId - Category ID to update
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Updated category data
 */
async function updateCategory(categoryId, categoryData) {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update category");
  }

  return await response.json();
}

/**
 * Category edit modal component (Intercepting Route)
 * Handles editing categories in a modal overlay
 * @param {Object} props - Component props
 * @param {Object} props.params - Route parameters
 * @param {string} props.params.id - Category ID to edit
 * @returns {JSX.Element} Category edit modal
 */
export default function EditCategoryModal({ params }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const categoryId = params.id;

  // Fetch category data
  const { data: category, isLoading } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => fetchCategory(categoryId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EditCategorySchema),
  });

  // Reset form when category data is loaded
  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [category, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateCategory(categoryId, data),
    onSuccess: () => {
      toast.success("Category updated successfully!");
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  /**
   * Handles modal close
   */
  const handleClose = () => {
    setOpen(false);
    router.back();
  };

  /**
   * Handles form submission
   * @param {Object} data - Form data
   */
  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!category) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-red-500">Category not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
