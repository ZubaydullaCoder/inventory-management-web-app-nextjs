// /src/lib/data/dashboard.js
import prisma from "@/lib/prisma";

/**
 * Fetches counts of user's data entities for dashboard state determination
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<{categories: number, suppliers: number, customers: number, products: number}>}
 */
export async function getDashboardCounts(userId) {
  const [categories, suppliers, customers, products] = await Promise.all([
    prisma.category.count({ where: { userId } }),
    prisma.supplier.count({ where: { userId } }),
    prisma.customer.count({ where: { userId } }),
    prisma.product.count({ where: { userId } }),
  ]);
  return { categories, suppliers, customers, products };
}
