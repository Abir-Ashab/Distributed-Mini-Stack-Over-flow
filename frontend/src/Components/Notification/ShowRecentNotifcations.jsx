import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import FetchAndDisplayFile2 from "../Posts/FetchAndDisplayFile2";

const NotificationAlert = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [newNotification, setNewNotification] = useState(false); 
  const [postUser, setPostUser] = useState(null); // State for storing user info
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = location.state; 

  const handleBack = () => {
    navigate("/post", { state: { id, flag: true } });
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:5003/notification");
        const filteredNotifications = response.data.filter((notification) => notification.user._id !== id);
        const lastSevenDaysNotifications = filterLastSevenDays(filteredNotifications);
        setNotifications(lastSevenDaysNotifications);
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();

    const interval = setInterval(async () => {
      const response = await axios.get("http://localhost:5003/notification");
      const lastSevenDaysNotifications = filterLastSevenDays(response.data);
      if (lastSevenDaysNotifications.length > notifications.length) {
        setNewNotification(true);  
        setNotifications(lastSevenDaysNotifications); 
      }
    }, 1000); 

    return () => clearInterval(interval);
  }, [notifications]);

  const fetchPostById = async (postId) => {
    setLoading(true); 
    try {
      const response = await axios.get(`http://localhost:5002/post/${postId}`);
      setSelectedPost(response.data); 
      // Fetch user info for the post
      const userResponse = await axios.get(`http://localhost:5001/auth/${response.data.user._id}`);
      setPostUser(userResponse.data); // Store the user info
    } catch (error) {
      console.error("Error fetching post", error);
    } finally {
      setLoading(false); 
    }
  };

  const filterLastSevenDays = (notifications) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return notifications.filter(notification => new Date(notification.createdAt) >= sevenDaysAgo);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); 
  };

  return (
    <div data-theme="dark" className="min-h-screen flex flex-col items-center py-6">
      <button 
        onClick={handleBack} 
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-600 transition duration-300"
      >
        Back
      </button>

      {newNotification && (
        <div className="bg-yellow-500 text-white p-3 rounded-lg mt-4 w-11/12 md:w-2/3 lg:w-1/2 text-center">
          New post created! Check out the latest notifications.
        </div>
      )}

      <div data-theme="dim" className="rounded-lg shadow-lg p-6 mt-6 w-11/12 md:w-2/3 lg:w-1/2">
        <h2 className="text-2xl font-semibold mb-4 text-center text-emerald-400">Recent Notifications (Last 7 Days)</h2>

        {notifications.length > 0 ? (
          notifications.map((notification) => (  
            <div data-theme="halloween" key={notification._id} className="flex justify-between items-center p-3 rounded-lg mb-2 shadow-sm">
              <p className="text-sm text-teal-400">Created at: {formatTime(notification.createdAt)}</p>
              <button
                onClick={() => fetchPostById(notification.postId)} 
                className="text-blue-500 hover:text-blue-700 transition"
              >
                View Post
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-zinc-50 mt-4">No new notifications</p>
        )}

        {loading ? (
          <p className="text-center text-zinc-5 mt-4">Loading post...</p>
        ) : selectedPost ? (
          <div key={selectedPost._id} className="card mb-10 bg-base-100 image-full w-96 shadow-xl">
            <div className="card-body">
              <p>{selectedPost.description}</p>
              {selectedPost.code ? (
                <SyntaxHighlighter data-theme="light"
                  language="javascript"
                  style={vscDarkPlus}
                  className="p-3 mt-2 rounded "
                  customStyle={{
                    width: "650px",
                    height: "auto",
                    overflowY: "auto",
                    overflowX: "auto",
                  }}
                >
                  {selectedPost.code}
                </SyntaxHighlighter>
              ) : (
                <div>
                  <FetchAndDisplayFile2 fileUrl={selectedPost.fileUrl} />
                </div>
              )}
              <div className="card-actions justify-end">
                <button className="btn w-[35%] h-12 btn-primary">
                  By: {postUser ? postUser.username : "Unknown User"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NotificationAlert;
