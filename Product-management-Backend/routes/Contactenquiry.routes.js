const express = require("express");
const router = express.Router();
const controller = require("../controllers/contactEnquiry.controller");
const validator = require("../validators/contactEnquiry.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");

// ── PUBLIC routes — no auth needed ────────────────────────────
// Website contact form submit
router.post("/submit", validator.submitValidation, validate, controller.submit);

// Newsletter subscribe
router.post("/subscribe", validator.subscribeValidation, validate, controller.subscribe);

// ── ADMIN routes — auth required ──────────────────────────────
router.get("/",         protect, controller.getAll);
router.get("/:id",      protect, validator.paramValidation, validate, controller.getOne);
router.patch("/:id/read", protect, validator.paramValidation, validate, controller.markRead);
router.delete("/bulk",  protect, controller.bulkDelete);
router.delete("/:id",   protect, validator.paramValidation, validate, controller.remove);

module.exports = router;