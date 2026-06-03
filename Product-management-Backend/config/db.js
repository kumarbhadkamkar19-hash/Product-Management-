const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("😊 DB Connected");
    })
    .catch((err) => {
      console.log("👺 DB Fail To Connect");
      console.log("Error:", err.message);
    });
}

module.exports = connectDB;
