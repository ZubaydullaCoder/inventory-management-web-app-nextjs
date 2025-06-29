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
