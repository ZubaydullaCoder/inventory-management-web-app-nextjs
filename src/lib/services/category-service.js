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
 * Fetches categories for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCategoriesByUser(userId) {
  try {
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    return categories;
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
    });

    return category;
  } catch (error) {
    // Prisma unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      throw new Error("A category with this name already exists");
    }
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Updates an existing category for the specified user
 * @param {string} userId - The user ID who owns the category
 * @param {string} categoryId - The category ID to update
 * @param {UpdateCategoryData} categoryData - Category data to update
 * @returns {Promise<Object>} Updated category object
 */
export async function updateCategory(userId, categoryId, categoryData) {
  try {
    // First check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: categoryData,
    });

    return category;
  } catch (error) {
    // Prisma unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      throw new Error("A category with this name already exists");
    }
    console.error("Error updating category:", error);
    throw new Error(error.message || "Failed to update category");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Deletes a category by ID for the specified user
 * Only allows deletion if no products are assigned to the category
 * @param {string} userId - The user ID who owns the category
 * @param {string} categoryId - The category ID to delete
 * @returns {Promise<void>}
 */
export async function deleteCategoryById(userId, categoryId) {
  try {
    // First check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
      },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    // Check if any products are assigned to this category
    const productsCount = await prisma.product.count({
      where: {
        categoryId,
        userId,
      },
    });

    if (productsCount > 0) {
      throw new Error(
        `Cannot delete category. ${productsCount} product(s) are assigned to this category. Please reassign or delete those products first.`
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error(error.message || "Failed to delete category");
  } finally {
    await prisma.$disconnect();
  }
}
