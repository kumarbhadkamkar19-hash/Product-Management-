const imageService = require("../services/images.service");

const handleError = (res, err) => {
  console.error("=== IMAGE ERROR ===", err.message);
  return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
};

exports.uploadImages = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required" });

    const images = await imageService.uploadImages(req.files, productId, req.admin._id);
    res.status(201).json({ success: true, message: `${images.length} image(s) uploaded`, data: images });
  } catch (err) { handleError(res, err); }
};

exports.deleteImage = async (req, res) => {
  try {
    const result = await imageService.deleteImage(req.params.id, req.admin._id);
    res.json({ success: true, ...result });
  } catch (err) { handleError(res, err); }
};

exports.setPrimary = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required" });

    const image = await imageService.setPrimary(req.params.id, productId, req.admin._id);
    res.json({ success: true, message: "Primary image updated", data: image });
  } catch (err) { handleError(res, err); }
};