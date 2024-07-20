import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SideBar.css";

const Sidebar = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Clear any local storage or context state if needed
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login"); // Redirect to login page or landing page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <button className="menu-btn" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleSidebar}>
          ×
        </button>
        <ul>
          <li>
            <Link to="/saved">Saved for later</Link>
          </li>
          <li>
            <Link to="/favorites">Favorite businesses</Link>
          </li>
          <li>
            <Link to={`/recommendations/${userId}`}>Recommended</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link onClick={handleLogout}>Log out</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
