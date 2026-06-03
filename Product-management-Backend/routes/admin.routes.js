// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const {
  validateAdminRegister,
  validateLogin,
} = require("../validators/admin.validator");
const { protect } = require("../middlewares/auth.middleware");
const { validateAndAttachDomain } = require("../middlewares/domain.middleware");

// 🔓 Public Routes
router.post("/register", validateAdminRegister, adminController.register);
router.post("/login", validateLogin, adminController.login);
router.post("/forgot-password", adminController.forgotPassword);
router.post("/reset-password/:token", adminController.resetPassword);

// 🔒 Protected Routes
router.use(protect);
router.get("/profile", adminController.getProfile);
router.put("/profile", adminController.updateProfile);

// 🌐 Domain-specific example (uncomment if needed)
// router.get("/verify-domain", validateAndAttachDomain, (req, res) => {
//   res.json({ success: true, message: `Domain ${req.domain} is valid & attached` });
// });

module.exports = router;
