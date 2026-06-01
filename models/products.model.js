const mongoose = require("mongoose");
const generateSlug = require("../utils/generateSlug");

const productSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    slug: { type: String, unique: true, lowercase: true },

    images: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
      validate: {
        validator: function (value) {
          return value.length <= 3;
        },
        message: "Maximum 3 images allowed per product.",
      },
    },

    videos: [{ type: String }],
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },

    seoTitle: String,
    seoDescription: String,
    tags: [String],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    rank: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

productSchema.pre("save", async function () {
  if (this.isModified("title")) this.slug = generateSlug(this.title);
});
module.exports = mongoose.model("Product", productSchema);
