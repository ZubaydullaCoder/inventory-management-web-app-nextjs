// /src/lib/services/product-service.js
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

/**
 * Checks if a product name is unique for a user
 * @param {string} userId - The user ID
 * @param {string} name - Product name to check
 * @param {string} [excludeProductId] - Product ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if name is unique, false otherwise
 */
export async function isProductNameUnique(
  userId,
  name,
  excludeProductId = null
) {
  try {
    const existingProduct = await prisma.product.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          mode: "insensitive",
        },
        ...(excludeProductId && { id: { not: excludeProductId } }),
      },
      select: { id: true },
    });

    return !existingProduct;
  } catch (error) {
    console.error("Error checking product name uniqueness:", error);
    throw new Error("Failed to check product name uniqueness");
  }
}

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
 * @property {string} [unit] - Product selling unit
 * @property {string} [categoryId] - Category ID (optional)
 * @property {string} [supplierId] - Supplier ID (optional)
 */

/**
 * Product update data
 * @typedef {Object} UpdateProductData
 * @property {string} [name] - Product name
 * @property {string} [description] - Product description
 * @property {string} [sku] - Product SKU
 * @property {number} [sellingPrice] - Product selling price
 * @property {number} [purchasePrice] - Product purchase price
 * @property {number} [stock] - Stock quantity
 * @property {number} [reorderPoint] - Reorder point threshold
 * @property {string} [unit] - Product selling unit
 * @property {string} [categoryId] - Category ID (optional)
 * @property {string} [supplierId] - Supplier ID (optional)
 */

/**
 * Generates a unique SKU for a user.
 * @param {string} userId
 * @returns {Promise<string>}
 */
async function generateUniqueSku(userId) {
  let sku;
  let exists = true;
  // Try up to 5 times to avoid rare collisions
  for (let i = 0; i < 5 && exists; i++) {
    sku = `SKU-${nanoid(8)}`;
    exists = await prisma.product.findFirst({
      where: { userId, sku },
      select: { id: true },
    });
  }
  if (exists) {
    throw new Error("Failed to generate unique SKU");
  }
  return sku;
}

/**
 * Creates a new product for the specified user
 * @param {string} userId - The user ID who owns the product
 * @param {CreateProductData} productData - Product data to create
 * @returns {Promise<Object>} Created product object
 */
export async function createProduct(userId, productData) {
  try {
    // Check name uniqueness
    const isNameUnique = await isProductNameUnique(userId, productData.name);
    if (!isNameUnique) {
      throw new Error("A product with this name already exists");
    }

    let sku = productData.sku?.trim();
    if (!sku) {
      sku = await generateUniqueSku(userId);
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        sku,
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
        unit: productData.unit || "piece",
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return product;
  } catch (error) {
    // Prisma unique constraint error
    if (error.code === "P2002") {
      if (error.meta?.target?.includes("name")) {
        throw new Error("A product with this name already exists");
      }
      if (error.meta?.target?.includes("sku")) {
        throw new Error("SKU must be unique for this user");
      }
    }
    console.error("Error creating product:", error);
    throw new Error(error.message || "Failed to create product");
  }
}

/**
 * Fetches products for a specific user with pagination
 * @param {string} userId - The user ID
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Items per page
 * @returns {Promise<Object>} Products list with pagination info
 */
export async function getProductsByUser(userId, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  try {
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
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Fetches a single product by ID for a specific user
 * @param {string} userId - The user ID
 * @param {string} productId - The product ID
 * @returns {Promise<Object|null>} Product object or null if not found
 */
export async function getProductById(userId, productId) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

/**
 * Updates a product for the specified user
 * @param {string} userId - The user ID who owns the product
 * @param {string} productId - The product ID to update
 * @param {UpdateProductData} productData - Product data to update
 * @returns {Promise<Object>} Updated product object
 */
export async function updateProduct(userId, productId, productData) {
  try {
    // Ensure the product belongs to the user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!existingProduct) {
      throw new Error("Product not found or access denied");
    }

    // Check name uniqueness if name is being updated
    if (productData.name && productData.name !== existingProduct.name) {
      const isNameUnique = await isProductNameUnique(
        userId,
        productData.name,
        productId
      );
      if (!isNameUnique) {
        throw new Error("A product with this name already exists");
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...productData,
        // Ensure numeric fields are properly typed
        sellingPrice: productData.sellingPrice
          ? Number(productData.sellingPrice)
          : undefined,
        purchasePrice: productData.purchasePrice
          ? Number(productData.purchasePrice)
          : undefined,
        stock:
          productData.stock !== undefined
            ? Number(productData.stock)
            : undefined,
        reorderPoint:
          productData.reorderPoint !== undefined
            ? Number(productData.reorderPoint)
            : undefined,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return product;
  } catch (error) {
    if (error.code === "P2002") {
      if (error.meta?.target?.includes("name")) {
        throw new Error("A product with this name already exists");
      }
      if (error.meta?.target?.includes("sku")) {
        throw new Error("SKU must be unique for this user");
      }
    }
    console.error("Error updating product:", error);
    throw new Error(error.message || "Failed to update product");
  }
}

/**
 * Deletes a product for the specified user (with transaction history check)
 * @param {string} userId - The user ID who owns the product
 * @param {string} productId - The product ID to delete
 * @returns {Promise<void>}
 */
export async function deleteProductById(userId, productId) {
  try {
    // Ensure the product belongs to the user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!existingProduct) {
      throw new Error("Product not found or access denied");
    }

    // Check for transaction history (sales, purchases, adjustments)
    // For MVP, we'll implement a basic check - this can be expanded later
    // when we have sales and purchase transaction tables

    // For now, just delete the product
    // TODO: Add transaction history checks when sales/purchase tables are implemented

    await prisma.product.delete({
      where: { id: productId },
    });
  } catch (error) {
    if (error.code === "P2003") {
      // Foreign key constraint error - has related records
      throw new Error(
        "Cannot delete product: it has associated transaction history. Consider deactivating it instead."
      );
    }
    console.error("Error deleting product:", error);
    throw new Error(error.message || "Failed to delete product");
  }
}
