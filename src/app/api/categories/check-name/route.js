// /src/app/api/categories/check-name/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Handles GET requests to check category name uniqueness
 * GET /api/categories/check-name?name=CategoryName&excludeId=123
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with uniqueness check result
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

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Build the query conditions
    const whereConditions = {
      userId: session.user.id,
      name: name.trim(),
    };

    // If excludeId is provided, exclude that category from the check
    if (excludeId) {
      whereConditions.id = {
        not: excludeId,
      };
    }

    const existingCategory = await prisma.category.findFirst({
      where: whereConditions,
    });

    const isUnique = !existingCategory;

    return NextResponse.json({
      isUnique,
      name: name.trim(),
    });
  } catch (error) {
    console.error("Error checking category name:", error);
    return NextResponse.json(
      { error: "Failed to check category name" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
