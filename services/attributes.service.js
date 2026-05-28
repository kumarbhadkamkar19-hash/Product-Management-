const Attribute = require("../models/attributes.model");
const Category = require("../models/categories.model");
const SubCategory = require("../models/subCategories.model");

class AttributeService {
  async getAttributes({ categoryId, subCategoryId, page = 1, limit = 20 } = {}) {
    const query = {};
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
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    };
  }

  // Returns attributes grouped for dynamic form rendering
  async getFilteredAttributes({ categoryId, subCategoryId }) {
    if (!categoryId) throw { status: 400, message: "categoryId is required" };

    const query = { category: categoryId };
    if (subCategoryId) {
      query.$or = [{ subCategory: null }, { subCategory: subCategoryId }];
    } else {
      query.subCategory = null;
    }

    const attributes = await Attribute.find(query).sort({ label: 1 });
    return attributes;
  }

  async createAttribute(data) {
    const category = await Category.findOne({ _id: data.category, isDeleted: false });
    if (!category) throw { status: 404, message: "Category not found" };

    if (data.subCategory) {
      const sub = await SubCategory.findOne({ _id: data.subCategory, isDeleted: false });
      if (!sub) throw { status: 404, message: "SubCategory not found" };
    }

    // Validate options required for select/radio/checkbox
    if (["select", "radio", "checkbox"].includes(data.type)) {
      if (!data.options || data.options.length === 0) {
        throw { status: 400, message: `Options are required for type '${data.type}'` };
      }
    }

    const attribute = new Attribute(data);
    await attribute.save();
    await attribute.populate("category", "name slug");
    if (attribute.subCategory) await attribute.populate("subCategory", "name slug");
    return attribute;
  }

  async updateAttribute(id, data) {
    const attribute = await Attribute.findById(id);
    if (!attribute) throw { status: 404, message: "Attribute not found" };

    if (["select", "radio", "checkbox"].includes(data.type || attribute.type)) {
      const options = data.options ?? attribute.options;
      if (!options || options.length === 0) {
        throw { status: 400, message: `Options are required for type '${data.type || attribute.type}'` };
      }
    }

    Object.assign(attribute, data);
    await attribute.save();
    await attribute.populate("category", "name slug");
    return attribute;
  }

  async deleteAttribute(id) {
    const attribute = await Attribute.findById(id);
    if (!attribute) throw { status: 404, message: "Attribute not found" };

    await attribute.deleteOne();
    return { message: "Attribute deleted successfully" };
  }
}

module.exports = new AttributeService();