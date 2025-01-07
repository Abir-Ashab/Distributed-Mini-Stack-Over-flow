const express = require("express"); 
const Post = require("../Models/Post");
const Notification = require("../Models/Notification");
const Minio = require('minio'); 
require('dotenv').config();
const multer = require('multer'); 
const router = express.Router();


const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD,
});

minioClient.bucketExists(process.env.MINIO_BUCKET, (err) => {
    if (err) {
        minioClient.makeBucket(process.env.MINIO_BUCKET, '', (err) => {
            if (err) console.log('Error creating bucket.', err);
            else console.log('Bucket created successfully');
        });
    } else {
        console.log('Bucket already exists');
    }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single('file'), async (req, res) => {
  const { description, code, userId, codeExtension } = req.body;
  const file = req.file;
  console.log(codeExtension);
  
  if (!description) {
    return res.status(400).send('Description is required.');
  }
  try {
    let postData = { description, user: userId };
    if (code) {
      const fileName = `${Date.now()}_post_code.${codeExtension}`;

      await minioClient.putObject(process.env.MINIO_BUCKET, fileName, Buffer.from(code), (err, etag) => {
        if (err) {
          return res.status(500).send('Error uploading code to MinIO.');
        }
        postData.code = code;
        postData.fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${fileName}`;
      });
    }
    if (file) {
      const fileName = `${Date.now()}_${file.originalname}`;

      await minioClient.putObject(process.env.MINIO_BUCKET, fileName, file.buffer, (err, etag) => {
        if (err) {
          return res.status(500).send('Error uploading file to MinIO.');
        }
        postData.fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${fileName}`;
      });
    }

    const post = new Post(postData);
    await post.save();

    const notification = new Notification({
      message: "New post created",
      postId: post._id,
      user: userId  
    });
    await notification.save();
    const populatedPost = await Post.findById(post._id).populate("user", "email _id").exec();
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create post" });
  }
});

router.get("/", async (req, res) => {
  const { userId } = req.query;
  try {
    const posts = await Post.find({ user: { $ne: userId } }).populate("user");
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve posts" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id).populate("user", "email _id");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve post" });
  }
});

router.delete("/all", async (req, res) => {
  try {
    const result = await Post.deleteMany({});
    
    if (result.deletedCount > 0) {
      res.json({ message: `${result.deletedCount} posts deleted.` });
    } else {
      res.json({ message: "No posts to delete." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete posts", error });
  }
});

module.exports = router;
