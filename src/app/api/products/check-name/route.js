// /src/app/api/products/check-name/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isProductNameUnique } from "@/lib/services/product-service";

/**
 * Handles GET requests to check product name uniqueness
 * GET /api/products/check-name?name=ProductName&excludeId=optionalId
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with uniqueness status
 */
export async function GET(request) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const excludeId = searchParams.get("excludeId");

    if (!name) {
      return NextResponse.json(
        { error: "Name parameter is required" },
        { status: 400 }
      );
    }

    const isUnique = await isProductNameUnique(
      session.user.id,
      name,
      excludeId
    );

    return NextResponse.json({
      success: true,
      isUnique,
      message: isUnique
        ? "Name is available"
        : "A product with this name already exists",
    });
  } catch (error) {
    console.error("Error checking product name:", error);
    return NextResponse.json(
      { error: "Failed to check product name" },
      { status: 500 }
    );
  }
}
