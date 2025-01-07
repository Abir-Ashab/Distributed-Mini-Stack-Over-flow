const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
   description: { type: String, required: true },  
   code: { type: String },                      
   fileUrl: { type: String },                     
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
