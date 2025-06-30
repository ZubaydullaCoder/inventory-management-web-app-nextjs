// /src/lib/api/categories-api.js
/**
 * Fetches categories from API
 * @returns {Promise<Array>} Array of categories
 */
export async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = await response.json();
  return data.data;
}

/**
 * Deletes a category via API
 * @param {string} categoryId - Category ID to delete
 * @returns {Promise<Object>} Delete response
 */
export async function deleteCategory(categoryId) {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete category");
  }

  return await response.json();
}
