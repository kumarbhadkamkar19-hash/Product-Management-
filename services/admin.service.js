// services/admin.service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Admin = require("../models/admin.model");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
  
const registerAdmin = async (data) => {
  const existingEmail = await Admin.findOne({ email: data.email });
  if (existingEmail) throw new Error("Email already registered");

  const existingDomain = await Admin.findOne({ domain: data.domain });
  if (existingDomain) throw new Error("Domain already registered");

  const salt = await bcrypt.genSalt(10);
  data.password = await bcrypt.hash(data.password, salt);

  const admin = await Admin.create(data);
  admin.password = undefined; // remove from response
  return { admin, token: generateToken(admin._id) };
};

const loginAdmin = async (email, password) => {
  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw new Error("Invalid email or password");
  }
  admin.password = undefined;
  return { admin, token: generateToken(admin._id) };
};

const forgotPassword = async (email) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("No admin found with this email");

  const resetToken = crypto.randomBytes(32).toString("hex");
  admin.resetPasswordToken = resetToken;
  admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await admin.save();

  // TODO: Integrate email service here (Nodemailer, SendGrid, etc.)
  return {
    message: "Password reset link generated. Check your email.",
    resetToken,
  };
};

const resetPassword = async (token, newPassword) => {
  const admin = await Admin.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!admin) throw new Error("Invalid or expired reset token");

  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(newPassword, salt);
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;
  await admin.save();

  return {
    message: "Password updated successfully",
    token: generateToken(admin._id),
  };
};

const updateProfile = async (adminId, updateData) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "companyName",
    "address",
    "mobile",
  ];
  const updates = {};
  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) updates[key] = updateData[key];
  });

  const admin = await Admin.findByIdAndUpdate(adminId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!admin) throw new Error("Admin not found");
  return admin;
};

module.exports = {
  registerAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
  updateProfile,
  generateToken,
};
