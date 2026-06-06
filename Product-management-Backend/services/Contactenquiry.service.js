const ContactEnquiry = require("../models/contactEnquiry.model");
const { getDomain, createError } = require("../utils/domain.helper");

class ContactEnquiryService {
  // ── PUBLIC — website varun submit hoto (no auth) ──────────
  async submit(data) {
    if (!data.domain) throw createError(400, "Domain is required");
    if (!data.name?.trim()) throw createError(400, "Name is required");
    if (!data.email?.trim()) throw createError(400, "Email is required");
    if (!data.message?.trim()) throw createError(400, "Message is required");

    const enquiry = new ContactEnquiry({
      domain:  data.domain.toLowerCase().trim(),
      name:    data.name.trim(),
      email:   data.email.trim().toLowerCase(),
      phone:   data.phone?.trim() || undefined,
      company: data.company?.trim() || undefined,
      country: data.country?.trim() || undefined,
      message: data.message.trim(),
      type:    data.type || "contact",
    });

    await enquiry.save();
    return enquiry;
  }

  // ── Newsletter subscribe (public) ─────────────────────────
  async subscribe(email, domain) {
    if (!email) throw createError(400, "Email is required");
    if (!domain) throw createError(400, "Domain is required");

    const enquiry = new ContactEnquiry({
      domain:  domain.toLowerCase().trim(),
      name:    "Newsletter Subscriber",
      email:   email.trim().toLowerCase(),
      message: `New newsletter subscription request from: ${email.trim().toLowerCase()}`,
      type:    "newsletter",
    });

    await enquiry.save();
    return enquiry;
  }

  // ── ADMIN — domain filtered ───────────────────────────────
  async getAll(adminId, { page = 1, limit = 10, type, isRead, search } = {}) {
    const domain = await getDomain(adminId);

    const query = { domain, isDeleted: false };
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === "true";
    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: "i" } },
        { email:   { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      ContactEnquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      ContactEnquiry.countDocuments(query),
      ContactEnquiry.countDocuments({ domain, isDeleted: false, isRead: false }),
    ]);

    return {
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      unreadCount,
    };
  }

  async getOne(id, adminId) {
    const domain = await getDomain(adminId);

    const enquiry = await ContactEnquiry.findOne({ _id: id, domain, isDeleted: false });
    if (!enquiry) throw createError(404, "Enquiry not found");

    // Auto mark as read when opened
    if (!enquiry.isRead) {
      enquiry.isRead = true;
      await enquiry.save();
    }

    return enquiry;
  }

  async markRead(id, adminId, isRead = true) {
    const domain = await getDomain(adminId);

    const enquiry = await ContactEnquiry.findOne({ _id: id, domain, isDeleted: false });
    if (!enquiry) throw createError(404, "Enquiry not found");

    enquiry.isRead = isRead;
    await enquiry.save();
    return enquiry;
  }

  async remove(id, adminId) {
    const domain = await getDomain(adminId);

    const enquiry = await ContactEnquiry.findOne({ _id: id, domain, isDeleted: false });
    if (!enquiry) throw createError(404, "Enquiry not found");

    enquiry.isDeleted = true;
    await enquiry.save();
    return { message: "Enquiry deleted successfully" };
  }

  async bulkDelete(ids, adminId) {
    const domain = await getDomain(adminId);

    await ContactEnquiry.updateMany(
      { _id: { $in: ids }, domain, isDeleted: false },
      { isDeleted: true }
    );
    return { message: `${ids.length} enquirie(s) deleted` };
  }
}

module.exports = new ContactEnquiryService();