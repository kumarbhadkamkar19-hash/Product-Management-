const Admin = require("../models/admin.model");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// ✅ Reusable domain fetcher — sarvatra ek jaagi
const getDomain = async (adminId) => {
  const admin = await Admin.findById(adminId).select("domain");
  if (!admin) throw createError(404, "Admin not found");
  if (!admin.domain) throw createError(400, "Admin domain not configured");
  return admin.domain;
};

module.exports = { getDomain, createError };