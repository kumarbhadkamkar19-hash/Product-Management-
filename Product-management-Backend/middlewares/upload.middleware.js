const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { AppError } = require("./error.middleware");

const uploadDir = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed."), false); // AppError ऐवजी Error
  } else {
    cb(null, true);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
