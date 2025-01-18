const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Notification Service: MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
const notificationRoutes = require("./routes/notification");
app.use("/notification", notificationRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Notification Service running on port ${process.env.PORT}`);
});
