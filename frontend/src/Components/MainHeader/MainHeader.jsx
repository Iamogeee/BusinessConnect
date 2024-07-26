import React, { useState, useEffect } from "react";
import "./MainHeader.css";
import SearchBar from "../SearchBar/SearchBar";
import FilterButton from "../FilterButton/FilterButton";
import SideBar from "../SideBar/SideBar";
import { Link } from "react-router-dom";
import Logo from "../../assets/BCLogo.png";

const MainHeader = ({ onCategoryChange, userId }) => {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    };

    fetchCategories();
  }, []);

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
  };

  const handleCategoryChange = (categoryId) => {
    onCategoryChange(categoryId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className="header">
      <div className="left-section">
        <button
          className={`sidebar-button" ${isSidebarOpen ? "open" : ""}`}
          onClick={toggleSidebar}
        >
          &#9776;
        </button>
        <Link to="/home" className="logo">
          <img src={Logo} alt="Business Connect Logo" className="logo-image" />
        </Link>
      </div>
      <div className="middle-section">
        <SearchBar onSelect={handleSelectBusiness} userId={userId} />
      </div>
      <div className="right-section">
        <button className="discover-button">Discover</button>
        <FilterButton
          categories={categories}
          onCategoryChange={handleCategoryChange}
        />
        <Link to="/profile" className="user-icon">
          <i className="fa-regular fa-user"></i>
        </Link>
      </div>
      <SideBar userId={userId} isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </header>
  );
};

export default MainHeader;
