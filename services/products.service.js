const Product = require("../models/products.model");
const Category = require("../models/categories.model");
const SubCategory = require("../models/subCategories.model");
const { getDomain, createError } = require("../utils/domain.helper");

class ProductService {
  _populate() {
    return [
      { path: "category", select: "name slug" },
      { path: "subCategory", select: "name slug" },
      { path: "images", select: "url alt isPrimary publicId" },
    ];
  }
  async getProducts(
    adminId,
    {
      page = 1,
      limit = 12,
      status,
      category,
      subCategory,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = {},
  ) {
    let domain;

    if (adminId) {
      domain = await getDomain(adminId);
    } else {
      // Public — category वरून domain काढ
      if (category) {
        const cat = await Category.findById(category).select("domain");
        if (!cat) throw createError(404, "Category not found");
        domain = cat.domain;
      } else {
        throw createError(400, "categoryId required for public access");
      }
    }

    const query = { domain, isDeleted: false, status: "active" }; // public ला फक्त active
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) query.title = { $regex: search, $options: "i" };

    const allowedSort = ["createdAt", "rank", "title"];
    const sortField = allowedSort.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Product.find(query)
        .populate(this._populate())
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProduct(id, adminId) {
    let domain;

    if (adminId) {
      domain = await getDomain(adminId);
    } else {
      // Public — product च्या domain वर trust कर
      const product = await Product.findOne({
        _id: id,
        isDeleted: false,
      }).populate(this._populate());
      if (!product) throw createError(404, "Product not found");
      return product;
    }

    const product = await Product.findOne({
      _id: id,
      domain,
      isDeleted: false,
    }).populate(this._populate());
    if (!product) throw createError(404, "Product not found");
    return product;
  }

  async createProduct(data, adminId) {
    const domain = await getDomain(adminId);

    const [category, subCategory] = await Promise.all([
      Category.findOne({
        _id: data.category,
        domain,
        isDeleted: false,
        status: "active",
      }),
      SubCategory.findOne({
        _id: data.subCategory,
        domain,
        isDeleted: false,
        status: "active",
      }),
    ]);

    if (!category)
      throw createError(404, "Active category not found in your domain");
    if (!subCategory)
      throw createError(404, "Active subCategory not found in your domain");
    if (String(subCategory.category) !== String(data.category)) {
      throw createError(
        400,
        "SubCategory does not belong to the given category",
      );
    }

    const product = new Product({ ...data, domain });
    await product.save();
    await product.populate(this._populate());
    return product;
  }

  async updateProduct(id, data, adminId) {
    const domain = await getDomain(adminId);

    const product = await Product.findOne({
      _id: id,
      domain,
      isDeleted: false,
    });
    if (!product) throw createError(404, "Product not found");

    if (data.category || data.subCategory) {
      const categoryId = data.category || product.category;
      const subCategoryId = data.subCategory || product.subCategory;

      const sub = await SubCategory.findOne({
        _id: subCategoryId,
        domain,
        isDeleted: false,
      });
      if (!sub) throw createError(404, "SubCategory not found");
      if (String(sub.category) !== String(categoryId)) {
        throw createError(
          400,
          "SubCategory does not belong to the given category",
        );
      }
    }

    Object.assign(product, data);
    await product.save();
    await product.populate(this._populate());
    return product;
  }

  async deleteProduct(id, adminId) {
    const domain = await getDomain(adminId);

    const product = await Product.findOne({
      _id: id,
      domain,
      isDeleted: false,
    });
    if (!product) throw createError(404, "Product not found");

    product.isDeleted = true;
    product.status = "draft";
    await product.save();
    return { message: "Product deleted successfully" };
  }
}

module.exports = new ProductService();
