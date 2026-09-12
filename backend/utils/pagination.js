/**
 * Extract and sanitize pagination parameters from query string.
 * @param {Object} query - Express req.query object
 * @param {number} defaultLimit - Default limit if omitted (default: 10)
 * @param {number} maxLimit - Maximum allowed limit (default: 100)
 */
const getPaginationParams = (query = {}, defaultLimit = 10, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const rawLimit = parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, rawLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Format standardized pagination metadata response structure.
 * @param {Array} items - Array of items for the current page
 * @param {number} totalItems - Total count of items matching the query
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 */
const formatPaginatedResponse = (items = [], totalItems = 0, page = 1, limit = 10) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  
  return {
    items,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Paginate an in-memory array of items.
 * @param {Array} array - Complete array of items
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
const paginateArray = (array = [], page = 1, limit = 10) => {
  const totalItems = array.length;
  const offset = (page - 1) * limit;
  const items = array.slice(offset, offset + limit);
  
  return formatPaginatedResponse(items, totalItems, page, limit);
};

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
  paginateArray,
};
