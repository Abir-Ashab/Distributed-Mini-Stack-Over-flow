import React, { useState, useEffect } from "react";
import axios from "axios";
import CreatePost from "./CreatePost";
import { useLocation } from "react-router-dom";
import Alert from "../Notification/Alert";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // VSCode-like dark theme
import FetchAndDisplayFile from "./FetchAndDisplayFile";
import Navbar from "../Navbar";


const ShowPost = () => {
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const location = useLocation();
  const { id, flag } = location.state; 

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5002/post", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch user info for each post
        const postsWithUsernames = await Promise.all(response.data.map(async (post) => {
          try {
            const userResponse = await axios.get(`http://localhost:5001/auth/${post.user._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            // Attach the username to the post
            post.username = userResponse.data.username; // Assuming 'username' is part of the response
            return post;
          } catch (error) {
            console.error("Error fetching user data", error);
            post.username = "Unknown User";
            return post;
          }
        }));

        setPosts(postsWithUsernames);
        console.log(postsWithUsernames);

      } catch (error) {
        console.error("Error fetching posts", error);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    setShowCreatePost(!showCreatePost);
  };

  const fetchFileContent = async (fileUrl) => {
    try {
      const response = await axios.get(fileUrl);
      return response.data; 
    } catch (error) {
      console.error("Error fetching file content:", error);
      return ""; 
    }
  };

  return (
    <div>
      <Navbar />
      <div data-theme="dark" className="min-h-screen p-8">
        <div className="flex mb-4 space-x-[80%]"> 
          <button onClick={handleCreatePost} className="bg-blue-500 text-white p-2 rounded">
            {showCreatePost ? "Close" : "Create New Post"}
          </button>
          <Alert id={id} flag={flag} />
        </div>
        {showCreatePost && <CreatePost userId={id} />}
        {[...posts].reverse().map((post) => (
          <div key={post._id} className="card mb-10 ml-[20%] bg-base-100 image-full w-96 shadow-xl">
            <div className="card-body">
              <p className="text-gray-50">{post.description}</p>
              {post.code ? (
                <SyntaxHighlighter data-theme="light"
                  language="javascript"
                  style={vscDarkPlus}
                  className="p-3 mt-2 rounded "
                  customStyle={{
                    width: "800px",   // Set your desired width
                    height: "auto",  // Set your desired height
                    overflowY: "auto", // Enable scrolling for long code blocks
                    overflowX: "auto",
                  }}
                >
                  {post.code}
                </SyntaxHighlighter>
              ) : (
                <div>
                  <a href="">{post.fileUrl}</a>
                  <FetchAndDisplayFile fileUrl={post.fileUrl} />
                </div>
              )}
              <div className="card-actions justify-end">
                <button className="w-[25%] h-12 btn btn-primary">
                  By: {post.username ? post.username : "Unknown User"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowPost;
