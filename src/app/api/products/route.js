// /src/app/api/products/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createProduct,
  getProductsByUser,
} from "@/lib/services/product-service";
import { CreateProductSchema } from "@/lib/schemas/product-schemas";

/**
 * Handles POST requests to create a new product
 * POST /api/products
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with created product
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
    const validatedData = CreateProductSchema.parse(body);

    // Create product via service layer
    const product = await createProduct(session.user.id, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Product created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation API error:", error);

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
 * Handles GET requests to fetch products
 * GET /api/products
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with products list
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

    // Fetch products via service layer
    const result = await getProductsByUser(session.user.id, { page, limit });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Products fetch API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
