// /src/app/api/categories/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCategoriesByUser,
  createCategory,
} from "@/lib/services/category-service";

/**
 * Category creation validation schema
 */
const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().optional(),
});

/**
 * Handles GET requests to fetch categories
 * GET /api/categories
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with categories
 */
export async function GET(request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await getCategoriesByUser(session.user.id);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new category
 * POST /api/categories
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with created category
 */
export async function POST(request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = CreateCategorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const category = await createCategory(
      session.user.id,
      validationResult.data
    );

    return NextResponse.json(
      {
        success: true,
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
