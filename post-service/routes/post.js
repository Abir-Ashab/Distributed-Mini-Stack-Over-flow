const express = require("express");
const Post = require("../models/Post");
const Minio = require('minio');
const axios = require("axios");
require('dotenv').config();
const multer = require('multer');
const router = express.Router();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD
});

async function initializeMinioBucket() {
  try {
    const bucketExists = await minioClient.bucketExists(process.env.MINIO_BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(process.env.MINIO_BUCKET);
      console.log(`Bucket ${process.env.MINIO_BUCKET} created successfully`);
    } else {
      console.log('Bucket already exists');
    }
    // Set bucket policy to public
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetBucketLocation', 's3:ListBucket', 's3:GetObject'],
          Resource: [`arn:aws:s3:::${process.env.MINIO_BUCKET}`, `arn:aws:s3:::${process.env.MINIO_BUCKET}/*`]
        }
      ]
    };
    await minioClient.setBucketPolicy(process.env.MINIO_BUCKET, JSON.stringify(policy));
    console.log('Bucket policy set to public');
  } catch (err) {
    console.error('Error initializing MinIO bucket:', err);
    throw err;
  }
}
initializeMinioBucket();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new post
router.post("/", upload.single('file'), async (req, res) => {
  const { description, code, userId, codeExtension } = req.body;
  const file = req.file;

  if (!description) {
      return res.status(400).send('Description is required.');
  }

  try {
      let postData = { 
          description, 
          user: { _id: userId } // Only store the userId directly as part of the post
      };

      if (code) {
          const fileName = `${Date.now()}_post_code.${codeExtension}`;
          await minioClient.putObject(process.env.MINIO_BUCKET, fileName, Buffer.from(code));
          postData.code = code;
          postData.fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${fileName}`;
      }

      if (file) {
          const fileName = `${Date.now()}_${file.originalname}`;
          await minioClient.putObject(process.env.MINIO_BUCKET, fileName, file.buffer);
          postData.fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${fileName}`;
      }

      const post = new Post(postData);
      await post.save();

      // Send notification (optional)
      const notificationData = {
          message: "New post created",
          postId: post._id,
          user: userId,
      };

      try {
          await axios.post('http://notification:5003/notification', notificationData);
          console.log('Notification sent successfully');
      } catch (error) {
          console.error('Failed to send notification:', error);
      }

      const postWithUser = await Post.findById(post._id);  // You don't need to populate user anymore

      res.status(201).json(postWithUser);

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create post" });
  }
});

router.get("/", async (req, res) => {
  const { userId } = req.query; // Exclude posts by this user
  try {
    const posts = await Post.find({ user: { $ne: userId } }).populate('user');

    // Format user data manually for each post
    const postsWithFormattedUser = posts.map(post => {
        const user = {
            _id: post.user._id,
            email: post.user.email,
            password: post.user.password,
            __v: post.user.__v
        };

        return { ...post._doc, user }; // Attach formatted user data
    });

    res.json(postsWithFormattedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve posts" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id).populate('user');
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Format user data manually
    const user = {
        _id: post.user._id,
        email: post.user.email,
        password: post.user.password,
        __v: post.user.__v
    };

    // Structure the post with formatted user data
    const postResponse = { ...post._doc, user };

    res.json(postResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve post" });
  }
});

// Delete all posts
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
