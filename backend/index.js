const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require('cors');

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors()); 
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const authRoutes = require("./Routes/auth");
const postRoutes = require("./Routes/post");
const notificationRoutes = require("./Routes/notification");

app.use("/auth", authRoutes);
app.use("/post", postRoutes);
app.use("/notification", notificationRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
