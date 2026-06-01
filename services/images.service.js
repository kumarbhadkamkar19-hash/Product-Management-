const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Image = require("../models/images.model");
const Product = require("../models/products.model");
const { getDomain, createError } = require("../utils/domain.helper");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error("Temp file delete failed:", e.message);
  }
};

class ImageService {
  async uploadImages(files, productId, adminId) {
    if (!files || files.length === 0)
      throw createError(400, "No files provided");

    const domain = await getDomain(adminId);

    // Product domain ownership check
    const product = await Product.findOne({
      _id: productId,
      domain,
      isDeleted: false,
    }).populate("images");
    if (!product) {
      files.forEach((f) => deleteTempFile(f.path));
      throw createError(404, "Product not found in your domain");
    }

    const currentCount = product.images.length;
    if (currentCount + files.length > 3) {
      files.forEach((f) => deleteTempFile(f.path));
      throw createError(
        400,
        `Cannot upload ${files.length} image(s). Product already has ${currentCount}/3 images.`,
      );
    }

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: `${domain}/products/${productId}`, // ✅ domain folder structure
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      }),
    );

    let results;
    try {
      results = await Promise.all(uploadPromises);
    } catch (err) {
      files.forEach((f) => deleteTempFile(f.path));
      throw createError(500, "Cloudinary upload failed: " + err.message);
    }

    files.forEach((f) => deleteTempFile(f.path));

    const isFirstBatch = currentCount === 0;
    const imageDocs = await Promise.all(
      results.map((result, idx) =>
        Image.create({
          product: productId,
          url: result.secure_url,
          publicId: result.public_id,
          alt: product.title,
          isPrimary: isFirstBatch && idx === 0,
        }),
      ),
    );

    product.images.push(...imageDocs.map((img) => img._id));
    await product.save();
    return imageDocs;
  }

  async deleteImage(imageId, adminId) {
    const domain = await getDomain(adminId);

    const image = await Image.findById(imageId).populate("product");
    if (!image) throw createError(404, "Image not found");

    // Domain ownership — product domain check
    if (String(image.product.domain) !== String(domain)) {
      throw createError(
        403,
        "Access denied — image does not belong to your domain",
      );
    }

    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (err) {
        console.error("Cloudinary delete failed:", err.message);
      }
    }

    await Product.findByIdAndUpdate(image.product._id, {
      $pull: { images: image._id },
    });

    if (image.isPrimary) {
      const product = await Product.findById(image.product._id).populate(
        "images",
      );
      if (product && product.images.length > 0) {
        await Image.findByIdAndUpdate(product.images[0]._id, {
          isPrimary: true,
        });
      }
    }

    await image.deleteOne();
    return { message: "Image deleted successfully" };
  }

  async setPrimary(imageId, productId, adminId) {
    const domain = await getDomain(adminId);

    const product = await Product.findOne({
      _id: productId,
      domain,
      isDeleted: false,
    });
    if (!product) throw createError(404, "Product not found in your domain");

    const image = await Image.findOne({ _id: imageId, product: productId });
    if (!image) throw createError(404, "Image not found for this product");

    await Image.updateMany({ product: productId }, { isPrimary: false });
    image.isPrimary = true;
    await image.save();
    return image;
  }
}

module.exports = new ImageService();
