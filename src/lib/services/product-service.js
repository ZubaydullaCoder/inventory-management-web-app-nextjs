// /src/lib/services/product-service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Product creation data
 * @typedef {Object} CreateProductData
 * @property {string} name - Product name
 * @property {string} [description] - Product description
 * @property {string} [sku] - Product SKU
 * @property {number} sellingPrice - Product selling price
 * @property {number} [purchasePrice] - Product purchase price
 * @property {number} [stock] - Initial stock quantity
 * @property {number} [reorderPoint] - Reorder point threshold
 * @property {string} [categoryId] - Category ID (optional)
 * @property {string} [supplierId] - Supplier ID (optional)
 */

/**
 * Creates a new product for the specified user
 * @param {string} userId - The user ID who owns the product
 * @param {CreateProductData} productData - Product data to create
 * @returns {Promise<Object>} Created product object
 */
export async function createProduct(userId, productData) {
  try {
    const product = await prisma.product.create({
      data: {
        ...productData,
        userId,
        // Ensure numeric fields are properly typed
        sellingPrice: Number(productData.sellingPrice),
        purchasePrice: productData.purchasePrice
          ? Number(productData.purchasePrice)
          : null,
        stock: productData.stock ? Number(productData.stock) : 0,
        reorderPoint: productData.reorderPoint
          ? Number(productData.reorderPoint)
          : 0,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  } finally {
    await prisma.$disconnect();
  }
}
