import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SideBar.css";

const Sidebar = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
            <Link to="/logout">Log out</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
