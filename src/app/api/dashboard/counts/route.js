// /src/app/api/dashboard/counts/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import prisma from "@/lib/prisma";

/**
 * Dashboard counts response data
 * @typedef {Object} DashboardCountsResponse
 * @property {number} categories - Number of user's categories
 * @property {number} suppliers - Number of user's suppliers
 * @property {number} customers - Number of user's customers
 * @property {number} products - Number of user's products
 */

/**
 * Fetches counts of user's data entities for dashboard state determination
 * GET /api/dashboard/counts
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with data counts
 */
export async function GET(request) {
  try {
    // Authentication check (Defense in Depth)
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch counts in parallel for better performance
    const [categoriesCount, suppliersCount, customersCount, productsCount] =
      await Promise.all([
        prisma.category.count({ where: { userId } }),
        prisma.supplier.count({ where: { userId } }),
        prisma.customer.count({ where: { userId } }),
        prisma.product.count({ where: { userId } }),
      ]);

    /** @type {DashboardCountsResponse} */
    const counts = {
      categories: categoriesCount,
      suppliers: suppliersCount,
      customers: customersCount,
      products: productsCount,
    };

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Dashboard counts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
