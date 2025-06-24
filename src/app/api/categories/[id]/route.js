// /src/app/api/categories/[id]/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCategoryById,
  updateCategory,
} from "@/lib/services/category-service";

/**
 * Category update schema for validation
 */
const UpdateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(255).optional(),
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

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
    console.error("Category fetch API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
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

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateCategorySchema.parse(body);

    // Update category via service layer
    const category = await updateCategory(session.user.id, id, validatedData);

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Category update API error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
