const mongoose = require("mongoose");
const generateSlug = require("../utils/generateSlug");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
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

// async pre-save — no callback needed
categorySchema.pre("save", async function () {
  if (this.isModified("name")) {
    this.slug = generateSlug(this.name);
  }
});

module.exports = mongoose.model("Category", categorySchema);
