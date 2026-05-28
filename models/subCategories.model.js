const mongoose = require("mongoose");
const generateSlug = require("../utils/generateSlug");

const subCategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

subCategorySchema.pre("save", async function () {
  if (this.isModified("name"))
    this.slug = `${generateSlug(this.name)}-${Date.now()}`;
});
module.exports = mongoose.model("SubCategory", subCategorySchema);
