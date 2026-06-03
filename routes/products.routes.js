const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const controller = require('../controllers/products.controller');
const validator = require('../validators/products.validator');

const router = express.Router();

router.get('/', controller.getProducts);           // public राहू दे
router.get('/:id', validator.paramValidation, controller.getProduct); // public राहू दे
router.post('/', protect, validator.createProductValidation, controller.createProduct);
router.put('/:id', protect, validator.updateProductValidation, controller.updateProduct);
router.delete('/:id', protect, validator.paramValidation, controller.deleteProduct);

module.exports = router;