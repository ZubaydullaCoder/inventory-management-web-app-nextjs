// /src/app/api/categories/[id]/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCategoryById,
  updateCategory,
  deleteCategoryById,
} from "@/lib/services/category-service";

/**
 * Category update validation schema
 */
const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

/**
 * Handles GET requests to fetch a single category
 * GET /api/categories/[id]
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Category ID
 * @returns {Promise<NextResponse>} JSON response with category data
 */
export async function GET(request, { params }) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch category via service layer
    const category = await getCategoryById(session.user.id, id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update a category
 * PUT /api/categories/[id]
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Category ID
 * @returns {Promise<NextResponse>} JSON response with updated category
 */
export async function PUT(request, { params }) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = UpdateCategorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Update category via service layer
    const category = await updateCategory(
      session.user.id,
      id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to delete a category
 * DELETE /api/categories/[id]
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Category ID
 * @returns {Promise<NextResponse>} JSON response with success message
 */
export async function DELETE(request, { params }) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteCategoryById(session.user.id, id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
