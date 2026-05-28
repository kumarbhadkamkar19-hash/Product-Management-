const Product = require("../models/products.model");
const Category = require("../models/categories.model");
const SubCategory = require("../models/subCategories.model");
const Image = require("../models/images.model");

class ProductService {
  _buildPopulate() {
    return [
      { path: "category", select: "name slug" },
      { path: "subCategory", select: "name slug" },
      { path: "images", select: "url alt isPrimary publicId" },
    ];
  }

  async getProducts({ page = 1, limit = 12, status, category, subCategory, search, sortBy = "createdAt", order = "desc" } = {}) {
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) query.title = { $regex: search, $options: "i" };

    const sortOrder = order === "asc" ? 1 : -1;
    const allowedSort = ["createdAt", "rank", "title"];
    const sortField = allowedSort.includes(sortBy) ? sortBy : "createdAt";

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Product.find(query)
        .populate(this._buildPopulate())
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return {
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    };
  }

  async getProduct(id) {
    const product = await Product.findOne({ _id: id, isDeleted: false }).populate(this._buildPopulate());
    if (!product) throw { status: 404, message: "Product not found" };
    return product;
  }

  async createProduct(data) {
    const [category, subCategory] = await Promise.all([
      Category.findOne({ _id: data.category, isDeleted: false, status: "active" }),
      SubCategory.findOne({ _id: data.subCategory, isDeleted: false, status: "active" }),
    ]);

    if (!category) throw { status: 404, message: "Active category not found" };
    if (!subCategory) throw { status: 404, message: "Active subCategory not found" };
    if (String(subCategory.category) !== String(data.category)) {
      throw { status: 400, message: "SubCategory does not belong to the given category" };
    }

    const product = new Product(data);
    await product.save();
    await product.populate(this._buildPopulate());
    return product;
  }

  async updateProduct(id, data) {
    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) throw { status: 404, message: "Product not found" };

    // Validate category/subCategory relationship if either is being updated
    if (data.category || data.subCategory) {
      const categoryId = data.category || product.category;
      const subCategoryId = data.subCategory || product.subCategory;

      const sub = await SubCategory.findOne({ _id: subCategoryId, isDeleted: false });
      if (!sub) throw { status: 404, message: "SubCategory not found" };
      if (String(sub.category) !== String(categoryId)) {
        throw { status: 400, message: "SubCategory does not belong to the given category" };
      }
    }

    Object.assign(product, data);
    await product.save();
    await product.populate(this._buildPopulate());
    return product;
  }

  async deleteProduct(id) {
    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) throw { status: 404, message: "Product not found" };

    product.isDeleted = true;
    product.status = "draft";
    await product.save();
    return { message: "Product deleted successfully" };
  }
}

module.exports = new ProductService();