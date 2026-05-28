const productService = require("../services/products.service");

const handleError = (res, err) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ success: false, message });
};

exports.getProducts = async (req, res) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProduct(req.params.id);
    res.json({ success: true, data: product });
  } catch (err) {
    handleError(res, err);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, message: "Product updated", data: product });
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};