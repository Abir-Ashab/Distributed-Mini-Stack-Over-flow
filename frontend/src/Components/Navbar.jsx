import React from "react";
import { useNavigate } from "react-router-dom";
import { SiGunicorn } from "react-icons/si";

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav data-theme="aqua" className=" text-white p-4">
      <div className="container mx-auto flex justify-between">

        <h1 className="flex justify-start text-xl font-bold">OverFlowYourStack < SiGunicorn className ="ml-5 mt-2"/></h1>
        <button onClick={handleSignOut} className="bg-red-500 py-2 px-4 rounded-lg">
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
