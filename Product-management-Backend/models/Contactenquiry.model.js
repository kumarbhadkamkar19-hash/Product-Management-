const mongoose = require("mongoose");

const contactEnquirySchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, trim: true, lowercase: true, index: true },
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, trim: true },
    company: { type: String, trim: true },
    country: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    type:    { type: String, enum: ["contact", "newsletter"], default: "contact" },
    isRead:  { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactEnquiry", contactEnquirySchema);