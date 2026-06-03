const express = require("express");
const router = express.Router();
const controller = require("../controllers/categories.controller");
const { protect } = require("../middlewares/auth.middleware");
const {
  validateCategory,
  paramValidation,
  validate,
} = require("../validators/categories.validator");

// ✅ saglyala protect — domain-based filter sathi auth required
router.post("/", protect, validateCategory, validate, controller.create);
router.get("/", protect, controller.getAll);
router.get("/:id", protect, paramValidation, validate, controller.getOne);
router.put(
  "/:id",
  protect,
  paramValidation,
  validate,
  validateCategory,
  validate,
  controller.update,
);
router.delete("/:id", protect, paramValidation, validate, controller.remove);

module.exports = router;
