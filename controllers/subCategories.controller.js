const subCategoryService = require("../services/subCategories.service");

const handleError = (res, err) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ success: false, message });
};

exports.getSubCategories = async (req, res) => {
  try {
    const result = await subCategoryService.getSubCategories(
      req.params.categoryId,
      req.query,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};

exports.createSubCategory = async (req, res) => {
  try {
    const subCategory = await subCategoryService.createSubCategory(req.body);
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
    const result = await subCategoryService.deleteSubCategory(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};
