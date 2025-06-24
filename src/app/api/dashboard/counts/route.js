// /src/app/api/dashboard/counts/route.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getDashboardCounts } from "@/lib/data/dashboard";

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
    const counts = await getDashboardCounts(userId);

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Dashboard counts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
