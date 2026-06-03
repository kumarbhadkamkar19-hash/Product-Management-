// middlewares/domain.middleware.js
const Admin = require("../models/admin.model"); // adjust path

const validateAndAttachDomain = async (req, res, next) => {
  let domain = req.headers["x-domain"] || req.body.domain;
  if (!domain) {
    return res
      .status(400)
      .json({ success: false, message: "Domain is required" });
  }

  domain = domain.toLowerCase().trim();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid domain format" });
  }

  req.domain = domain;

  // Optional: verify domain exists in DB (set req.checkDomainExists = true in route if needed)
  if (req.checkDomainExists) {
    const exists = await Admin.exists({ domain });
    if (!exists) {
      return res
        .status(404)
        .json({ success: false, message: "Domain not registered" });
    }
  }

  next();
};

module.exports = { validateAndAttachDomain };
