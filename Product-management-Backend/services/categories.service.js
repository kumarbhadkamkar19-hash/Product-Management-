const Category = require("../models/categories.model");
const Admin = require("../models/admin.model");
const generateSlug = require("../utils/generateSlug");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

class CategoryService {
  async _getDomain(adminId) {
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) throw createError(404, "Admin not found");
    if (!admin.domain) throw createError(400, "Admin domain not set");
    return admin.domain;
  }

  async create(data, adminId) {
    const domain = await this._getDomain(adminId);

    // Active duplicate check
    const existing = await Category.findOne({
      domain,
      name: data.name,
      isDeleted: false,
    });
    if (existing)
      throw createError(409, "Category with this name already exists");

    // Deleted असेल तर restore कर
    const deleted = await Category.findOne({
      domain,
      name: data.name,
      isDeleted: true,
    });
    if (deleted) {
      deleted.isDeleted = false;
      deleted.status = data.status || "active";
      await deleted.save();
      return deleted;
    }

    // Unique slug
    let slug = generateSlug(data.name);
    const slugExists = await Category.findOne({ domain, slug });
    if (slugExists) slug = `${slug}-${Date.now()}`;

    const category = new Category({ ...data, domain, slug });
    await category.save();
    return category;
  }git add .
  async getAll(adminId, { page = 1, limit = 10, status, search } = {}) {
    const domain = await this._getDomain(adminId);

    const query = { domain, isDeleted: false };
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Category.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Category.countDocuments(query),
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

  async getOne(id, adminId) {
    const domain = await this._getDomain(adminId);

    const category = await Category.findOne({
      _id: id,
      domain,
      isDeleted: false,
    });
    if (!category) throw createError(404, "Category not found");
    return category;
  }

  async update(id, data, adminId) {
    const domain = await this._getDomain(adminId);

    const category = await Category.findOne({
      _id: id,
      domain,
      isDeleted: false,
    });
    if (!category) throw createError(404, "Category not found");

    if (data.name && data.name !== category.name) {
      const duplicate = await Category.findOne({
        domain,
        name: data.name,
        isDeleted: false,
        _id: { $ne: id },
      });
      if (duplicate)
        throw createError(409, "Category with this name already exists");

      // Slug update
      let slug = generateSlug(data.name);
      const slugExists = await Category.findOne({
        domain,
        slug,
        _id: { $ne: id },
      });
      if (slugExists) slug = `${slug}-${Date.now()}`;
      data.slug = slug;
    }

    Object.assign(category, data);
    await category.save();
    return category;
  }

  async remove(id, adminId) {
    const domain = await this._getDomain(adminId);

    const category = await Category.findOne({
      _id: id,
      domain,
      isDeleted: false,
    });
    if (!category) throw createError(404, "Category not found");

    category.isDeleted = true;
    category.status = "inactive";
    await category.save();
    return { message: "Category deleted successfully" };
  }
}

module.exports = new CategoryService();
