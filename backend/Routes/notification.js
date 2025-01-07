const express = require("express");
const Notification = require("../Models/Notification");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const notifications = await Notification.find({ seenBy: { $ne: userId } })
      .sort({ createdAt: -1 })
      .populate("user", "email _id"); 

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve notifications" });
  }
});

router.post("/mark-as-seen", async (req, res) => {
  try {
    const { userId } = req.body;
    await Notification.updateMany({ seenBy: { $ne: userId } }, { $push: { seenBy: userId } });
    res.json({ message: "Notifications marked as seen." });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications as seen", error });
  }
});
router.get("/count", async (req, res) => {
  const { userId } = req.query;
  console.log(userId);
  try {
    // Count documents where the user is not the author and userId is not in the seenBy array
    const postCount = await Notification.countDocuments({
      user: { $ne: userId },
      seenBy: { $ne: userId }  // Check that userId is not in the seenBy array
    });
    res.json({ count: postCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve post count" });
  }
});

// Delete notifications older than 7 days 
router.delete("/older", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const result = await Notification.deleteMany({ createdAt: { $lt: sevenDaysAgo } });

    if (result.deletedCount > 0) {
      res.json({ message: `${result.deletedCount} notifications deleted.` });
    } else {
      res.json({ message: "No notifications to delete." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notifications", error });
  }
});

router.delete("/all", async (req, res) => {
  try {
    const result = await Notification.deleteMany({});
    
    if (result.deletedCount > 0) {
      res.json({ message: `${result.deletedCount} notifications deleted.` });
    } else {
      res.json({ message: "No notifications to delete." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete all notifications", error });
  }
});

module.exports = router;
