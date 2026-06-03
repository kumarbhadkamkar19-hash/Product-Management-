const { body, query, param } = require("express-validator");
const { validationResult } = require("express-validator");

exports.createAttributeValidation = [
  body("key").trim().notEmpty().withMessage("Key is required"),
  body("label").trim().notEmpty().withMessage("Label is required"),
  body("type")
    .isIn([
      "text",
      "textarea",
      "number",
      "select",
      "checkbox",
      "radio",
      "boolean",
    ])
    .withMessage("Invalid type"),
  body("category").isMongoId().withMessage("Valid category ID required"),
  body("subCategory")
    .optional()
    .isMongoId()
    .withMessage("Valid subCategory ID required"),
  body("options").optional().isArray().withMessage("Options must be an array"),
];

exports.updateAttributeValidation = [
  param("id").isMongoId().withMessage("Valid attribute ID required"),
  body("key").optional().trim().notEmpty(),
  body("label").optional().trim().notEmpty(),
  body("type")
    .optional()
    .isIn([
      "text",
      "textarea",
      "number",
      "select",
      "checkbox",
      "radio",
      "boolean",
    ]),
  body("options").optional().isArray(),
];

exports.filterValidation = [
  query("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Valid category ID required"),
  query("subCategoryId")
    .optional()
    .isMongoId()
    .withMessage("Valid subCategory ID required"),
];

// ✅ This was missing — caused the crash
exports.paramValidation = [
  param("id").isMongoId().withMessage("Valid ID required"),
];
