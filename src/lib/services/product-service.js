// /src/lib/services/product-service.js
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid"; // Add this import

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
 * Product update data
 * @typedef {Object} UpdateProductData
 * @property {string} [name] - Product name
 * @property {string} [description] - Product description
 * @property {string} [sku] - Product SKU
 * @property {number} [sellingPrice] - Product selling price
 * @property {number} [purchasePrice] - Product purchase price
 * @property {number} [stock] - Stock quantity
 * @property {number} [reorderPoint] - Reorder point threshold
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
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return product;
  } catch (error) {
    // Prisma unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("sku")) {
      throw new Error("SKU must be unique for this user.");
    }
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  } finally {
    await prisma.$disconnect();
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
  } finally {
    await prisma.$disconnect();
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
  } finally {
    await prisma.$disconnect();
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
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  } finally {
    await prisma.$disconnect();
  }
}
