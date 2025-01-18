const mongoose = require('mongoose');

// Post schema definition
const PostSchema = new mongoose.Schema({
    description: { type: String, required: true },
    code: { type: String },
    fileUrl: { type: String },
    user: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        email: { type: String },
        password: { type: String},
        __v: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
