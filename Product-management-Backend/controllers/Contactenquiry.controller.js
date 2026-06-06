const enquiryService = require("../services/contactEnquiry.service");

const handleError = (res, err) => {
  console.error("=== ENQUIRY ERROR ===", err.message);
  return res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
};

// ── PUBLIC ────────────────────────────────────────────────────

// POST /api/enquiry/submit — website contact form
exports.submit = async (req, res) => {
  try {
    const enquiry = await enquiryService.submit(req.body);
    res.status(201).json({ success: true, message: "Enquiry submitted successfully", data: enquiry });
  } catch (err) { handleError(res, err); }
};

// POST /api/enquiry/subscribe — newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email, domain } = req.body;
    const enquiry = await enquiryService.subscribe(email, domain);
    res.status(201).json({ success: true, message: "Subscribed successfully", data: enquiry });
  } catch (err) { handleError(res, err); }
};

// ── ADMIN ─────────────────────────────────────────────────────

// GET /api/enquiry — all enquiries (domain filtered)
exports.getAll = async (req, res) => {
  try {
    const result = await enquiryService.getAll(req.admin._id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { handleError(res, err); }
};

// GET /api/enquiry/:id — single enquiry (auto marks read)
exports.getOne = async (req, res) => {
  try {
    const enquiry = await enquiryService.getOne(req.params.id, req.admin._id);
    res.json({ success: true, data: enquiry });
  } catch (err) { handleError(res, err); }
};

// PATCH /api/enquiry/:id/read — mark read/unread
exports.markRead = async (req, res) => {
  try {
    const isRead = req.body.isRead !== false; // default true
    const enquiry = await enquiryService.markRead(req.params.id, req.admin._id, isRead);
    res.json({ success: true, message: `Marked as ${isRead ? "read" : "unread"}`, data: enquiry });
  } catch (err) { handleError(res, err); }
};

// DELETE /api/enquiry/:id — soft delete
exports.remove = async (req, res) => {
  try {
    const result = await enquiryService.remove(req.params.id, req.admin._id);
    res.json({ success: true, ...result });
  } catch (err) { handleError(res, err); }
};

// DELETE /api/enquiry/bulk — bulk delete
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required" });
    }
    const result = await enquiryService.bulkDelete(ids, req.admin._id);
    res.json({ success: true, ...result });
  } catch (err) { handleError(res, err); }
};