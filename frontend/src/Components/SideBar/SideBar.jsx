import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SideBar.css";

const SideBar = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState({
    profilePicture: "",
    name: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `http://localhost:3000/api/user/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch user data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <div className="sidebar-header">
        <div className="profile-picture">
          <img
            src={
              user.profilePicture
                ? `http://localhost:3000/${user.profilePicture}`
                : "http://localhost:3000/default-profile-photo.jpeg"
            }
            alt="Profile"
          />
        </div>
        <h3>{user.name}</h3>
      </div>
      <ul>
        <li>
          <Link to="/home" onClick={onClose}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/saved" onClick={onClose}>
            Saved for later
          </Link>
        </li>
        <li>
          <Link to="/favorites" onClick={onClose}>
            Favorite businesses
          </Link>
        </li>
        <li>
          <Link to={`/recommendations/${userId}`} onClick={onClose}>
            Recommended
          </Link>
        </li>
        <li>
          <Link to="/profile" onClick={onClose}>
            Profile
          </Link>
        </li>
        <li>
          <Link onClick={handleLogout}>Log out</Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
