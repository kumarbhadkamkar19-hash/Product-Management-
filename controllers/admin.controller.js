
const adminService = require("../services/admin.service");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.register = asyncHandler(async (req, res) => {
  const { admin, token } = await adminService.registerAdmin(req.body);
  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    admin,
    token,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { admin, token } = await adminService.loginAdmin(
    req.body.email,
    req.body.password,
  );
  res
    .status(200)
    .json({ success: true, message: "Login successful", admin, token });
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const admin = await adminService.updateProfile(req.admin._id, req.body);
  res.status(200).json({ success: true, message: "Profile updated", admin });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const result = await adminService.forgotPassword(req.body.email);
  res.status(200).json({ success: true, ...result });
});
exports.resetPassword = asyncHandler(async (req, res) => {
  const result = await adminService.resetPassword(
    req.params.token,
    req.body.password,
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});
