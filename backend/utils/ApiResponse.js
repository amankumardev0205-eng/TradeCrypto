/**
 * Standardized API Response Structure
 */
class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return res.status(201).json(new ApiResponse(201, data, message));
  }
}

module.exports = ApiResponse;
