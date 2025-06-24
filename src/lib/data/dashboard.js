// /src/lib/data/dashboard.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Dashboard counts response data
 * @typedef {Object} DashboardCounts
 * @property {number} categories - Number of user's categories
 * @property {number} suppliers - Number of user's suppliers
 * @property {number} customers - Number of user's customers
 * @property {number} products - Number of user's products
 */

/**
 * Fetches counts of user's data entities for dashboard state determination
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<DashboardCounts>} User data counts
 */
export async function getDashboardCounts(userId) {
  try {
    const [categories, suppliers, customers, products] = await Promise.all([
      prisma.category.count({ where: { userId } }),
      prisma.supplier.count({ where: { userId } }),
      prisma.customer.count({ where: { userId } }),
      prisma.product.count({ where: { userId } }),
    ]);

    return { categories, suppliers, customers, products };
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    throw new Error("Failed to fetch dashboard counts");
  } finally {
    await prisma.$disconnect();
  }
}
