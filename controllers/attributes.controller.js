const attributeService = require("../services/attributes.service");

const handleError = (res, err) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  return res.status(status).json({ success: false, message });
};

exports.getAttributes = async (req, res) => {
  try {
    const result = await attributeService.getAttributes(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};

exports.getFilteredAttributes = async (req, res) => {
  try {
    const data = await attributeService.getFilteredAttributes(req.query);
    res.json({ success: true, data });
  } catch (err) {
    handleError(res, err);
  }
};

exports.createAttribute = async (req, res) => {
  try {
    const attribute = await attributeService.createAttribute(req.body);
    res.status(201).json({ success: true, message: "Attribute created", data: attribute });
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateAttribute = async (req, res) => {
  try {
    const attribute = await attributeService.updateAttribute(req.params.id, req.body);
    res.json({ success: true, message: "Attribute updated", data: attribute });
  } catch (err) {
    handleError(res, err);
  }
};

exports.deleteAttribute = async (req, res) => {
  try {
    const result = await attributeService.deleteAttribute(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    handleError(res, err);
  }
};