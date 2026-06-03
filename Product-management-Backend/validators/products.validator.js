const { body, param } = require('express-validator');

exports.createProductValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').isMongoId().withMessage('Valid category ID required'),
  body('subCategory').isMongoId().withMessage('Valid subCategory ID required'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('rank').optional().isNumeric().withMessage('Rank must be a number'),
];

// ✅ This was missing — caused the crash
exports.updateProductValidation = [
  param('id').isMongoId().withMessage('Valid product ID required'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('category').optional().isMongoId().withMessage('Valid category ID required'),
  body('subCategory').optional().isMongoId().withMessage('Valid subCategory ID required'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('rank').optional().isNumeric().withMessage('Rank must be a number'),
];

exports.paramValidation = [
  param('id').isMongoId().withMessage('Valid product ID required'),
];

exports.validateImagesArray = async (req, res, next) => {
  const images = req.body.images;
  if (Array.isArray(images) && images.length > 3) {
    return res.status(400).json({ success: false, message: 'Maximum 3 images allowed' });
  }
  next();
};