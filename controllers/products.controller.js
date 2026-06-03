const productService = require("../services/products.service");

const handleError = (res, err) => {
  console.error("=== PRODUCT ERROR ===", err.message);
  return res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal server error" });
};

exports.getProducts = async (req, res) => {
  try {
    const result = await productService.getProducts(req.admin?._id, req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProduct(
      req.params.id,
      req.admin?._id,
    );
    res.json({ success: true, data: product });
  } catch (err) {
    handleError(res, err);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body, req.admin._id);
    res
      .status(201)
      .json({ success: true, message: "Product created", data: product });
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.admin._id,
    );
    res.json({ success: true, message: "Product updated", data: product });
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(
      req.params.id,
      req.admin._id,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};
