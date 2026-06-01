const Category = require("../models/categories.model");
const Admin = require("../models/admin.model");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

class CategoryService {
  
  //  adminId varun domain kadhto — he helper sarvatra vaparto
  async _getDomain(adminId) {
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) throw createError(404, "Admin not found");
    if (!admin.domain) throw createError(400, "Admin domain not set");
    return admin.domain;
  }

  //  CREATE — domain auto-attach
  async create(data, adminId) {
    const domain = await this._getDomain(adminId);

    const existing = await Category.findOne({
      domain,
      name: data.name,
      isDeleted: false,
    });
    if (existing) throw createError(409, "Category with this name already exists");

    const category = new Category({ ...data, domain });
    await category.save();
    return category;
  }
  
  //  GET ALL — faqt is domain che categories
  async getAll(adminId, { page = 1, limit = 10, status, search } = {}) {
    const domain = await this._getDomain(adminId);

    const query = { domain, isDeleted: false };
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
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

  // ✅ GET ONE — domain check with ownership
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

  // ✅ UPDATE — faqt apli category update hoi
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
      if (duplicate) throw createError(409, "Category with this name already exists");
    }

    Object.assign(category, data);
    await category.save();
    return category;
  }

  // ✅ DELETE — faqt apli category delete hoi
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