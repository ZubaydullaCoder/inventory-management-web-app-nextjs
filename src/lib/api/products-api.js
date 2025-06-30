// /src/lib/api/products-api.js
/**
 * Fetches the list of products from the API.
 * @returns {Promise<Object>} The full paginated data object
 */
export async function fetchProducts() {
  const response = await fetch("/api/products?limit=100");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  return data.data;
}

/**
 * Fetches a single product by ID
 * @param {string} productId - Product ID to fetch
 * @returns {Promise<Object>} Product data
 */
export async function fetchProduct(productId) {
  const response = await fetch(`/api/products/${productId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  const data = await response.json();
  return data.data;
}

/**
 * Updates a product via API
 * @param {string} productId - Product ID to update
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product data
 */
export async function updateProduct(productId, productData) {
  const apiData = {
    ...productData,
    sellingPrice: parseFloat(productData.sellingPrice),
    purchasePrice: productData.purchasePrice
      ? parseFloat(productData.purchasePrice)
      : undefined,
    stock: productData.stock ? parseInt(productData.stock) : undefined,
    reorderPoint: productData.reorderPoint
      ? parseInt(productData.reorderPoint)
      : undefined,
    // Don't send empty categoryId
    categoryId:
      productData.categoryId === "uncategorized"
        ? undefined
        : productData.categoryId,
  };

  const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update product");
  }

  return await response.json();
}

/**
 * Deletes a product via API
 * @param {string} productId - Product ID to delete
 * @returns {Promise<Object>} Delete response
 */
export async function deleteProduct(productId) {
  const response = await fetch(`/api/products/${productId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete product");
  }

  return await response.json();
}

/**
 * Creates a new product via API
 * @param {Object} productData - Product data to create
 * @returns {Promise<Object>} API response
 */
export async function createProduct(productData) {
  // Convert string numbers to actual numbers for API
  const apiData = {
    ...productData,
    sellingPrice: parseFloat(productData.sellingPrice),
    purchasePrice: productData.purchasePrice
      ? parseFloat(productData.purchasePrice)
      : undefined,
    stock: productData.stock ? parseInt(productData.stock) : undefined,
    reorderPoint: productData.reorderPoint
      ? parseInt(productData.reorderPoint)
      : undefined,
    // Don't send empty categoryId
    categoryId:
      productData.categoryId === "uncategorized"
        ? undefined
        : productData.categoryId,
  };

  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create product");
  }

  return await response.json();
}
