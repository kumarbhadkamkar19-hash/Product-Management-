const Category = require("../models/categories.model");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

class CategoryService {
  async create(data) {
    const existing = await Category.findOne({ name: data.name, isDeleted: false });
    if (existing) throw createError(409, "Category with this name already exists");

    const category = new Category(data);
    await category.save();
    return category;
  }

  async getAll({ page = 1, limit = 10, status, search } = {}) {
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Category.countDocuments(query),
    ]);

    return {
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    };
  }

  async getOne(id) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) throw createError(404, "Category not found");
    return category;
  }

  async update(id, data) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) throw createError(404, "Category not found");

    if (data.name && data.name !== category.name) {
      const duplicate = await Category.findOne({ name: data.name, isDeleted: false, _id: { $ne: id } });
      if (duplicate) throw createError(409, "Category with this name already exists");
    }

    Object.assign(category, data);
    await category.save();
    return category;
  }

  async remove(id) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) throw createError(404, "Category not found");

    category.isDeleted = true;
    category.status = "inactive";
    await category.save();
    return { message: "Category deleted successfully" };
  }
}

module.exports = new CategoryService();