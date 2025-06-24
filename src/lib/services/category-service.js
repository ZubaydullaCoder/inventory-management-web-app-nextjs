// /src/lib/services/category-service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Category creation data
 * @typedef {Object} CreateCategoryData
 * @property {string} name - Category name
 * @property {string} [description] - Category description
 */

/**
 * Category update data
 * @typedef {Object} UpdateCategoryData
 * @property {string} [name] - Category name
 * @property {string} [description] - Category description
 */

/**
 * Creates a new category for the specified user
 * @param {string} userId - The user ID who owns the category
 * @param {CreateCategoryData} categoryData - Category data to create
 * @returns {Promise<Object>} Created category object
 */
export async function createCategory(userId, categoryData) {
  try {
    const category = await prisma.category.create({
      data: {
        ...categoryData,
        userId,
      },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    return {
      ...category,
      _count: {
        products: category.products.length,
      },
      products: undefined, // Remove the products array, keep only the count
    };
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetches categories for a specific user with pagination
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @returns {Promise<Object>} Categories list with pagination info
 */
export async function getCategoriesByUser(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  try {
    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.category.count({ where: { userId } }),
    ]);

    return {
      categories,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetches a single category by ID for a specific user
 * @param {string} userId - The user ID
 * @param {string} categoryId - The category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export async function getCategoryById(userId, categoryId) {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw new Error("Failed to fetch category");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Updates a category for the specified user
 * @param {string} userId - The user ID who owns the category
 * @param {string} categoryId - The category ID to update
 * @param {UpdateCategoryData} categoryData - Category data to update
 * @returns {Promise<Object>} Updated category object
 */
export async function updateCategory(userId, categoryId, categoryData) {
  try {
    // Ensure the category belongs to the user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!existingCategory) {
      throw new Error("Category not found or access denied");
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: categoryData,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return category;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  } finally {
    await prisma.$disconnect();
  }
}