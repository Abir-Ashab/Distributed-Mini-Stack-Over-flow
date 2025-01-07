import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Navbar from "./Components/Navbar";
import ShowPost from "./Components/Posts/ShowPost";
import NotificationAlert from "./Components/Notification/ShowRecentNotifcations";

function App() {
  return (
    <Router>
      <div >
        <Routes>
          <Route path="/" element= {<Home></Home>} />
          <Route 
            path="/notification" 
            element={<NotificationAlert />} 
          />
          <Route 
            path="/post" 
            element={<ShowPost />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
