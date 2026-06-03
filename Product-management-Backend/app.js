const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const connectDB = require("./config/db");
const { globalErrorHandler } = require("./middlewares/error.middleware"); // ✅ import

const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();
  
app.use("/api/admin", adminRoutes);
app.use("/api/categories", require("./routes/categories.routes"));
app.use("/api/sub-categories", require("./routes/subCategories.routes"));
app.use("/api/attributes", require("./routes/attributes.routes"));
app.use("/api/products", require("./routes/products.routes"));
app.use("/api/images", require("./routes/images.routes"));

app.get("/", (req, res) => {
  res.send("🚀 API is running successfully...");
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
