import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Alert = (props) => {
  const [Count, setCount] = useState(0); 
  const [notification, setNotification] = useState(false); 
  const navigate = useNavigate();
  const {id} = props;  
  const fetchPostCount = async () => {
    try {
      const response = await axios.get("http://localhost:5000/notification/count?userId=" + id);
      console.log(response);
      const postCount = response.data.count;
      setCount(postCount)
    } catch (error) {
      console.error("Error fetching post count:", error);
    }
  };

  useEffect(() => {
    fetchPostCount();
    const interval = setInterval(fetchPostCount, 100);  
    return () => clearInterval(interval); 
  }, [Count]);  

  const handleNotification = async() => {
    setNotification(!notification);
    await axios.post("http://localhost:5000/notification/mark-as-seen", { userId: id });
    navigate("/notification", { state: { id } });  
  };

  return (
    <div className="relative">
      <button onClick={() => handleNotification()} className="relative">
        <FontAwesomeIcon icon={faBell} size="3x" /> 
        {Count > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-2 py-1">
            {Count}
          </span>
        )}
      </button>
    </div>
  );
};

export default Alert;
