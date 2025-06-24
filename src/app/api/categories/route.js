// /src/app/api/categories/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createCategory,
  getCategoriesByUser,
} from "@/lib/services/category-service";

/**
 * Category creation schema for validation
 */
const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().optional(),
});

/**
 * Handles POST requests to create a new category
 * POST /api/categories
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with created category
 */
export async function POST(request) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateCategorySchema.parse(body);

    // Create category via service layer
    const category = await createCategory(session.user.id, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Category creation API error:", error);

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

/**
 * Handles GET requests to fetch categories
 * GET /api/categories
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with categories list
 */
export async function GET(request) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch categories via service layer
    const result = await getCategoriesByUser(session.user.id, { page, limit });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Categories fetch API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
