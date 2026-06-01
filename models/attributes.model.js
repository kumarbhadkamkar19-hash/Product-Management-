const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },               
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    key: { type: String, required: true, lowercase: true, trim: true },
    label: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true, lowercase: true },
    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "number",
        "select",
        "checkbox",
        "radio",
        "boolean",
      ],
      default: "text",
    },
    required: { type: Boolean, default: false },
    placeholder: String,
    defaultValue: { type: mongoose.Schema.Types.Mixed },
    options: [{ type: String }],
    validation: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

attributeSchema.index({ category: 1, key: 1 }, { unique: false, sparse: true });
attributeSchema.index(
  { subCategory: 1, key: 1 },
  { unique: false, sparse: true },
);

module.exports = mongoose.model("Attribute", attributeSchema);
