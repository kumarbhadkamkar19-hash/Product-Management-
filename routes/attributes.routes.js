const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const controller = require('../controllers/attributes.controller');
const validator = require('../validators/attributes.validator');

const router = express.Router();

router.get(
  "/",
  validator.filterValidation,
  validate,
  controller.getAttributes
);

router.get(
  "/filter",
  validator.filterValidation,
  validate,
  controller.getFilteredAttributes
);

router.post(
  "/",
  protect,
  validator.createAttributeValidation,
  validate,
  controller.createAttribute
);

router.put(
  "/:id",
  protect,
  validator.updateAttributeValidation,
  validate,
  controller.updateAttribute
);

router.delete(
  "/:id",
  protect,
  validator.paramValidation,
  validate,
  controller.deleteAttribute
);

module.exports = router;