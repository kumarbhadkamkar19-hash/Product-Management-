const Attribute = require("../models/attributes.model");
const Category = require("../models/categories.model");
const SubCategory = require("../models/subCategories.model");
const { getDomain, createError } = require("../utils/domain.helper");

class AttributeService {
  async getAttributes(
    adminId,
    { categoryId, subCategoryId, page = 1, limit = 20 } = {},
  ) {
    const domain = await getDomain(adminId);

    const query = { domain };
    if (categoryId) query.category = categoryId;
    if (subCategoryId) query.subCategory = subCategoryId;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Attribute.find(query)
        .populate("category", "name slug")
        .populate("subCategory", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Attribute.countDocuments(query),
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
  async getFilteredAttributes(adminId, { categoryId, subCategoryId }) {
    if (!categoryId) throw createError(400, "categoryId is required");

    let domain;

    if (adminId) {
      domain = await getDomain(adminId);
    } else {
      // Public request — category वरून domain घे
      const category = await Category.findById(categoryId).select("domain");
      if (!category) throw createError(404, "Category not found");
      domain = category.domain;
    }

    const query = { domain, category: categoryId };
    if (subCategoryId) {
      query.$or = [{ subCategory: null }, { subCategory: subCategoryId }];
    } else {
      query.subCategory = null;
    }

    const attributes = await Attribute.find(query).sort({ label: 1 });
    return attributes;
  }
  async createAttribute(data, adminId) {
    const domain = await getDomain(adminId);

    // Category domain check
    const category = await Category.findOne({
      _id: data.category,
      domain,
      isDeleted: false,
    });
    if (!category) throw createError(404, "Category not found in your domain");

    if (data.subCategory) {
      const sub = await SubCategory.findOne({
        _id: data.subCategory,
        domain,
        isDeleted: false,
      });
      if (!sub) throw createError(404, "SubCategory not found in your domain");
    }

    if (["select", "radio", "checkbox"].includes(data.type)) {
      if (!data.options || data.options.length === 0) {
        throw createError(400, `Options are required for type '${data.type}'`);
      }
    }

    const attribute = new Attribute({ ...data, domain });
    await attribute.save();
    await attribute.populate("category", "name slug");
    return attribute;
  }

  async updateAttribute(id, data, adminId) {
    const domain = await getDomain(adminId);

    const attribute = await Attribute.findOne({ _id: id, domain });
    if (!attribute) throw createError(404, "Attribute not found");

    if (["select", "radio", "checkbox"].includes(data.type || attribute.type)) {
      const options = data.options ?? attribute.options;
      if (!options || options.length === 0) {
        throw createError(
          400,
          `Options are required for type '${data.type || attribute.type}'`,
        );
      }
    }

    Object.assign(attribute, data);
    await attribute.save();
    await attribute.populate("category", "name slug");
    return attribute;
  }

  async deleteAttribute(id, adminId) {
    const domain = await getDomain(adminId);

    const attribute = await Attribute.findOne({ _id: id, domain });
    if (!attribute) throw createError(404, "Attribute not found");

    await attribute.deleteOne();
    return { message: "Attribute deleted successfully" };
  }
}

module.exports = new AttributeService();
