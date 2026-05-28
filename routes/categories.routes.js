const express = require("express");
const router = express.Router();
const controller = require("../controllers/categories.controller");
const { validateCategory, paramValidation, validate } = require("../validators/categories.validator");

router.post("/", validateCategory, controller.create);
router.get("/", controller.getAll);
router.get("/:id", paramValidation, validate, controller.getOne);
router.put("/:id", paramValidation, validate, validateCategory, controller.update);
router.delete("/:id", paramValidation, validate, controller.remove);

module.exports = router;