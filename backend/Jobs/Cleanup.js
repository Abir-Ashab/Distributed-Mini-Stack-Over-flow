const Notification = require("../Models/Notification");

const cleanUpNotifications = async () => {
   const oneDayAgo = new Date();
   oneDayAgo.setDate(oneDayAgo.getDate() - 1);

   await Notification.deleteMany({ createdAt: { $lt: oneDayAgo } });
   console.log("Old notifications deleted");
};

module.exports = cleanUpNotifications;
