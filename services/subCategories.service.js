const SubCategory = require("../models/subCategories.model");
const Category = require("../models/categories.model");
const { getDomain, createError } = require("../utils/domain.helper");

class SubCategoryService {
  async getSubCategories(categoryId, adminId, { page = 1, limit = 10, status, search } = {}) {
    const domain = await getDomain(adminId);

    // Category domain ownership check
    const category = await Category.findOne({ _id: categoryId, domain, isDeleted: false });
    if (!category) throw createError(404, "Category not found");

    const query = { category: categoryId, domain, isDeleted: false };
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      SubCategory.find(query)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SubCategory.countDocuments(query),
    ]);

    return {
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    };
  }

  async createSubCategory({ category: categoryId, name, status }, adminId) {
    const domain = await getDomain(adminId);

    const category = await Category.findOne({ _id: categoryId, domain, isDeleted: false, status: "active" });
    if (!category) throw createError(404, "Active category not found in your domain");

    const existing = await SubCategory.findOne({ category: categoryId, domain, name, isDeleted: false });
    if (existing) throw createError(409, "SubCategory with this name already exists in this category");

    const subCategory = new SubCategory({ category: categoryId, name, status, domain });
    await subCategory.save();
    await subCategory.populate("category", "name slug");
    return subCategory;
  }

  async updateSubCategory(id, data, adminId) {
    const domain = await getDomain(adminId);

    const subCategory = await SubCategory.findOne({ _id: id, domain, isDeleted: false });
    if (!subCategory) throw createError(404, "SubCategory not found");

    if (data.name && data.name !== subCategory.name) {
      const duplicate = await SubCategory.findOne({
        category: subCategory.category,
        domain,
        name: data.name,
        isDeleted: false,
        _id: { $ne: id },
      });
      if (duplicate) throw createError(409, "SubCategory with this name already exists");
    }

    Object.assign(subCategory, data);
    await subCategory.save();
    await subCategory.populate("category", "name slug");
    return subCategory;
  }

  async deleteSubCategory(id, adminId) {
    const domain = await getDomain(adminId);

    const subCategory = await SubCategory.findOne({ _id: id, domain, isDeleted: false });
    if (!subCategory) throw createError(404, "SubCategory not found");

    subCategory.isDeleted = true;
    subCategory.status = "inactive";
    await subCategory.save();
    return { message: "SubCategory deleted successfully" };
  }
}

module.exports = new SubCategoryService();