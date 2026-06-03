const subCategoryService = require("../services/subCategories.service");

const handleError = (res, err) => {
  console.error("=== SUBCATEGORY ERROR ===", err.message);
  return res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal server error" });
};

// subCategories.controller.js
exports.getSubCategories = async (req, res) => {
  try {
    const adminId = req.admin?._id ?? null; // ← safe access
    const result = await subCategoryService.getSubCategories(
      req.params.categoryId,
      adminId,
      req.query,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};

exports.createSubCategory = async (req, res) => {
  try {
    const subCategory = await subCategoryService.createSubCategory(
      req.body,
      req.admin._id,
    );
    res
      .status(201)
      .json({
        success: true,
        message: "SubCategory created",
        data: subCategory,
      });
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const subCategory = await subCategoryService.updateSubCategory(
      req.params.id,
      req.body,
      req.admin._id,
    );
    res.json({
      success: true,
      message: "SubCategory updated",
      data: subCategory,
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const result = await subCategoryService.deleteSubCategory(
      req.params.id,
      req.admin._id,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};
