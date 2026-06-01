const categoryService = require("../services/categories.service");

const handleError = (res, err) => {
  console.error("=== CATEGORY CONTROLLER ERROR ===", err);
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ success: false, message });
};

// POST /api/categories
exports.create = async (req, res) => {
  try {
    // ✅ req.admin._id — auth middleware ne set kela
    const category = await categoryService.create(req.body, req.admin._id);
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/categories
exports.getAll = async (req, res) => {
  try {
    const result = await categoryService.getAll(req.admin._id, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/categories/:id
exports.getOne = async (req, res) => {
  try {
    const category = await categoryService.getOne(req.params.id, req.admin._id);
    res.json({ success: true, data: category });
  } catch (err) {
    handleError(res, err);
  }
};

// PUT /api/categories/:id
exports.update = async (req, res) => {
  try {
    const category = await categoryService.update(req.params.id, req.body, req.admin._id);
    res.json({ success: true, message: "Category updated", data: category });
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE /api/categories/:id
exports.remove = async (req, res) => {
  try {
    const result = await categoryService.remove(req.params.id, req.admin._id);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};