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
