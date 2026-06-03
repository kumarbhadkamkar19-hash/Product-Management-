class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

const globalErrorHandler = (err, req, res, next) => {
  console.error("=== GLOBAL ERROR ===");
  console.error("Type:", typeof err);
  console.error("Constructor:", err?.constructor?.name);
  console.error("Message:", err?.message);
  console.error("Status:", err?.status);
  console.error("StatusCode:", err?.statusCode);
  console.error("Stack:", err?.stack);
  console.error("Full err:", JSON.stringify(err, null, 2));
  console.error("====================");

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `Duplicate value for '${field}'`,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { AppError, globalErrorHandler };
