const { body, param } = require("express-validator");

exports.createSubCategoryValidation = [
  body("name").trim().notEmpty(),
  body("category")
    .isMongoId()
    .withMessage("Valid category ID required"),
];

exports.updateSubCategoryValidation = [
  param("id").isMongoId(),
  body("name").optional().trim(),
  body("category").optional().isMongoId(),
];

exports.paramValidation = [
  param("categoryId")
    .isMongoId()
    .withMessage("Valid category ID required"),
];

exports.idValidation = [
  param("id")
    .isMongoId()
    .withMessage("Valid subcategory ID required"),
];