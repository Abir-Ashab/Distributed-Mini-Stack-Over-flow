const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId }, // No `ref` for strict decoupling
  user: { type: mongoose.Schema.Types.ObjectId },   // No `ref` for strict decoupling
  seenBy: [{ type: mongoose.Schema.Types.ObjectId }], // Array to track seen users
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", NotificationSchema);
