// /src/lib/data/products.js
import prisma from "@/lib/prisma";

/**
 * Fetches products for a specific user with pagination
 * @param {string} userId
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {Promise<Object>}
 */
export async function getProductsByUser(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: { userId },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where: { userId } }),
  ]);

  return {
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}
