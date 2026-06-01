const { param } = require("express-validator");
const validate = require("../middlewares/validate.middleware");

// Existing custom middleware — unchanged
exports.validateCategory = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Request body cannot be empty",
      error: "Please provide category data in JSON format",
    });
  }
  console.log("=== validateCategory called ===", typeof next);
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Validation    failed",
      errors: [
        {
          field: "name",
          message: "Category name is required and must be a non-empty string",
        },
      ],
    });
  }

  req.body.name = name.trim();
  next();
};

// Param validation for /:id routes
exports.paramValidation = [
  param("id").isMongoId().withMessage("Valid category ID required"),
];

exports.validate = validate;
