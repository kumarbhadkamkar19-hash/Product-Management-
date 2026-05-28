class ApiResponse {
  constructor(success, statusCode, message, data = null, pagination = null) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (pagination) this.pagination = pagination;
  }
}

module.exports = { ApiResponse };