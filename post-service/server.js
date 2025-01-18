// post-service/src/index.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Post MongoDB connected"))
  .catch((err) => console.log(err));

const postRoutes = require("./routes/post");
app.use("/post", postRoutes);

const createNotification = async (postData) => {
  try {
    await fetch('http://notification-service:5003/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "New post created",
        postId: postData._id,
        user: postData.user
      }),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Post Service running on port ${PORT}`);
});

