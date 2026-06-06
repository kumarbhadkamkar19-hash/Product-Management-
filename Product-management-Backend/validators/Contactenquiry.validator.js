const { body, param } = require("express-validator");

exports.submitValidation = [
  body("domain").notEmpty().withMessage("Domain is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("type").optional().isIn(["contact", "newsletter"]).withMessage("Type must be contact or newsletter"),
];

exports.subscribeValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("domain").notEmpty().withMessage("Domain is required"),
];

exports.paramValidation = [
  param("id").isMongoId().withMessage("Valid ID required"),
];