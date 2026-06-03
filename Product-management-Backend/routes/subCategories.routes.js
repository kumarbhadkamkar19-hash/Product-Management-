const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const controller = require("../controllers/subCategories.controller");
const validator = require("../validators/subCategories.validator");

const router = express.Router();

// subCategories.routes.js
router.get(
  "/:categoryId",
  protect, // ← हे add कर
  validator.paramValidation,
  validate,
  controller.getSubCategories,
);
router.post(
  "/",
  protect,
  validator.createSubCategoryValidation,
  validate,
  controller.createSubCategory,
);
router.put(
  "/:id",
  protect,
  validator.updateSubCategoryValidation,
  validate,
  controller.updateSubCategory,
);
router.delete(
  "/:id",
  protect,
  validator.idValidation,
  validate,
  controller.deleteSubCategory,
);
module.exports = router;
