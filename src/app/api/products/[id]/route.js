// /src/app/api/products/[id]/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getProductById,
  updateProduct,
  deleteProductById,
} from "@/lib/services/product-service";

/**
 * Product update validation schema
 */
const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  sellingPrice: z.number().positive().optional(),
  purchasePrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().min(0).optional(),
  unit: z.string().optional(),
  categoryId: z.string().optional(),
});

/**
 * Handles GET requests to fetch a single product
 * GET /api/products/[id]
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Product ID
 * @returns {Promise<NextResponse>} JSON response with product data
 */
export async function GET(request, { params }) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch product via service layer
    const product = await getProductById(session.user.id, id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update a product
 * PUT /api/products/[id]
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Product ID
 * @returns {Promise<NextResponse>} JSON response with updated product
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
    const validationResult = UpdateProductSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Update product via service layer
    const product = await updateProduct(
      session.user.id,
      id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to delete a product
 * DELETE /api/products/[id]
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Product ID
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
    await deleteProductById(session.user.id, id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
