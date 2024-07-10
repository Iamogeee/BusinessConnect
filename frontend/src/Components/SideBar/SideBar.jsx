import React, { useState } from "react";
import "./SideBar.css";

const Sidebar = () => {
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
            <a href="/saved">Saved for later</a>
          </li>
          <li>
            <a href="/liked">Liked businesses</a>
          </li>
          <li>
            <a href="/profile">Profile</a>
          </li>
          <li>
            <a href="/logout">Log out</a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
