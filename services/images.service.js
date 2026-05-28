const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Image = require("../models/images.model");
const Product = require("../models/products.model");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: local disk file delete karto upload nantar
const deleteTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error("Temp file delete failed:", e.message);
  }
};

class ImageService {
  async uploadImages(files, productId) {
    if (!files || files.length === 0)
      throw { status: 400, message: "No files provided" };
    if (!productId) throw { status: 400, message: "productId is required" };

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).populate("images");
    if (!product) {
      files.forEach((f) => deleteTempFile(f.path));
      throw { status: 404, message: "Product not found" };
    }

    const currentCount = product.images.length;
    if (currentCount + files.length > 3) {
      files.forEach((f) => deleteTempFile(f.path));
      throw {
        status: 400,
        message: `Cannot upload ${files.length} image(s). Product already has ${currentCount}/3 images.`,
      };
    }

    // Upload disk files to Cloudinary in parallel
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: `products/${productId}`,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      }),
    );

    let results;
    try {
      results = await Promise.all(uploadPromises);
    } catch (err) {
      files.forEach((f) => deleteTempFile(f.path));
      throw {
        status: 500,
        message: "Cloudinary upload failed: " + err.message,
      };
    }

    // Cleanup temp files after successful upload
    files.forEach((f) => deleteTempFile(f.path));

    const isFirstBatch = currentCount === 0;

    // Save Image documents
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

    // Push image IDs into product
    product.images.push(...imageDocs.map((img) => img._id));
    await product.save();

    return imageDocs;
  }

  async deleteImage(imageId) {
    const image = await Image.findById(imageId).populate("product");
    if (!image) throw { status: 404, message: "Image not found" };

    // Delete from Cloudinary
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (err) {
        console.error("Cloudinary delete failed:", err.message);
      }
    }

    // Remove reference from product
    await Product.findByIdAndUpdate(image.product._id, {
      $pull: { images: image._id },
    });

    // If deleted image was primary, promote next available image
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

  async setPrimary(imageId, productId) {
    const image = await Image.findOne({ _id: imageId, product: productId });
    if (!image)
      throw { status: 404, message: "Image not found for this product" };

    await Image.updateMany({ product: productId }, { isPrimary: false });
    image.isPrimary = true;
    await image.save();
    return image;
  }

  async getProductImages(productId) {
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) throw { status: 404, message: "Product not found" };

    const images = await Image.find({ product: productId }).sort({
      isPrimary: -1,
      createdAt: 1,
    });
    return images;
  }
}

module.exports = new ImageService();
