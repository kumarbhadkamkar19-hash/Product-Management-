const attributeService = require("../services/attributes.service");

const handleError = (res, err) => {
  console.error("=== ATTRIBUTE ERROR ===", err.message);
  return res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal server error" });
};

exports.getAttributes = async (req, res) => {
  try {
    const result = await attributeService.getAttributes(
      req.admin?._id,
      req.query,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getFilteredAttributes = async (req, res) => {
  try {
    const data = await attributeService.getFilteredAttributes(
      req.admin?._id,
      req.query,
    );
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
};

exports.createAttribute = async (req, res) => {
  try {
    const attribute = await attributeService.createAttribute(
      req.body,
      req.admin._id,
    );
    res
      .status(201)
      .json({ success: true, message: "Attribute created", data: attribute });
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateAttribute = async (req, res) => {
  try {
    const attribute = await attributeService.updateAttribute(
      req.params.id,
      req.body,
      req.admin._id,
    );
    res.json({ success: true, message: "Attribute updated", data: attribute });
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteAttribute = async (req, res) => {
  try {
    const result = await attributeService.deleteAttribute(
      req.params.id,
      req.admin._id,
    );
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};
