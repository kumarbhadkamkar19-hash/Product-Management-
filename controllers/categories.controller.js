const categoryService = require("../services/categories.service");

const handleError = (res, err) => {
  console.error("=== CONTROLLER ERROR ===", err);  // हे add कर
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ success: false, message });
};
exports.create = async (req, res) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = await categoryService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getOne = async (req, res) => {
  try {
    const category = await categoryService.getOne(req.params.id);
    res.json({ success: true, data: category });
  } catch (err) {
    handleError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const category = await categoryService.update(req.params.id, req.body);
    res.json({ success: true, message: "Category updated", data: category });
  } catch (err) {
    handleError(res, err);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await categoryService.remove(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};