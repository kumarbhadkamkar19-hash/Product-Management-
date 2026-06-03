const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const controller = require('../controllers/images.controller');

const router = express.Router();

router.post('/upload', protect, upload.array("images", 3), controller.uploadImages);
router.delete('/:id', protect, controller.deleteImage);

module.exports = router;