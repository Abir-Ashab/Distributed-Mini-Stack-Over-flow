const express = require("express");
const mongoose = require('mongoose');
const Notification = require("../models/Notification");
const axios = require("axios"); // Use axios for external API calls
const router = express.Router();

// Helper function to fetch user data         
const fetchUserData = async (userId) => {
  try { 
    const response = await axios.get(`http://localhost:5001/auth/${userId}`);
    return response.data; // Return user data from the API
  } catch (error) { 
    console.error(`Failed to fetch user data for ID: ${userId}`, error); 
    return null; 
  }
};

router.post('/', async (req, res) => {
    try {
        // Ensure postId is a valid ObjectId using 'new' keyword
        const postId = new mongoose.Types.ObjectId(req.body.postId);
    
        // Create the notification
        const notification = new Notification({
          message: req.body.message,
          postId: postId,  // Here we assign the valid ObjectId
          user: req.body.user,
        });
    
        // Save notification
        await notification.save();
        res.status(201).json({ message: 'Notification created successfully', notification });
      } catch (error) {
        console.error('Error creating notification:', error);
        res.status(400).json({ message: 'Notification validation failed', error: error.message });
      }
  });
// Get unseen notifications
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const notifications = await Notification.find({ seenBy: { $ne: userId } }).sort({ createdAt: -1 });

    // Fetch user data for each notification
    const notificationsWithUser = await Promise.all(
      notifications.map(async (notification) => {
        const user = await fetchUserData(notification.user);
        return { ...notification._doc, user }; // Merge notification data with user info
      })
    );

    res.json(notificationsWithUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve notifications", error });
  }
});

// Mark notifications as seen
router.post("/mark-as-seen", async (req, res) => {
  try {
    const { userId } = req.body;
    await Notification.updateMany({ seenBy: { $ne: userId } }, { $push: { seenBy: userId } });
    res.json({ message: "Notifications marked as seen." });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications as seen", error });
  }
});

// Get unseen notifications count
router.get("/count", async (req, res) => {
  try {
    const { userId } = req.query;
    const count = await Notification.countDocuments({ seenBy: { $ne: userId } });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve notifications count", error });
  }
});

// Delete notifications older than 7 days
router.delete("/older", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const result = await Notification.deleteMany({ createdAt: { $lt: sevenDaysAgo } });

    res.json({ message: `${result.deletedCount || 0} notifications deleted.` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete old notifications", error });
  }
});

// Delete all notifications
router.delete("/all", async (req, res) => {
  try {
    const result = await Notification.deleteMany({});
    res.json({ message: `${result.deletedCount || 0} notifications deleted.` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete all notifications", error });
  }
});

module.exports = router;