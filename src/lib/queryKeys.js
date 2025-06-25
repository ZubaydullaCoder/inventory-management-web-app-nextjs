// /src/lib/queryKeys.js
/**
 * @typedef {'products' | 'categories' | 'suppliers' | 'customers'} QueryKeyResource
 */

export const queryKeys = {
  /**
   * @param {QueryKeyResource} resource
   * @param {Record<string, any>} [params]
   */
  list: (resource, params) => [resource, "list", params].filter(Boolean),
  /**
   * @param {QueryKeyResource} resource
   * @param {string} id
   */
  detail: (resource, id) => [resource, "detail", id],
  /**
   * Session-specific query for tracking created items in current session
   * @param {QueryKeyResource} resource
   */
  session: (resource) => [resource, "session"],
};
