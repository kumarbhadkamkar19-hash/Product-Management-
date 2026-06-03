const mongoose = require("mongoose");
const generateSlug = require("../utils/generateSlug");

const categorySchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: [true, "Domain is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

//  domain + name unique together (different domains can have same category name)
categorySchema.index({ domain: 1, name: 1 }, { unique: true });
categorySchema.index({ domain: 1, slug: 1 }, { unique: true });

categorySchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = generateSlug(this.name);
  }
});

module.exports = mongoose.model("Category", categorySchema);
