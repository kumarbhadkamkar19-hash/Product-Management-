const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Image", imageSchema);
