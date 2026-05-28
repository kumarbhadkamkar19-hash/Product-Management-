const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  url: { type: String, required: true },
  publicId: { type: String },
  alt: { type: String, trim: true },
  isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const controller = require('../controllers/images.controller');

const router = express.Router();

router.post('/upload', protect, upload.array("images", 3), controller.uploadImages);
router.delete('/:id', protect, controller.deleteImage);

module.exports = router;