import React, { useState, useEffect } from "react";
import "./MainHeader.css";
import SearchBar from "../SearchBar/SearchBar";
import FilterButton from "../FilterButton/FilterButton";
import Sidebar from "../SideBar/SideBar";
import { Link, useNavigate } from "react-router-dom";

const MainHeader = ({ onCategoryChange }) => {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [categories, setCategories] = useState([]);

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

  return (
    <header className="header">
      <div className="logo-and-sidebar">
        <Sidebar />
        <Link to="/home">
          <h1>
            Business <span>Connect</span>
          </h1>
        </Link>
      </div>
      <nav>
        <button className="discover-button">Discover</button>
        <div className="filter-search">
          <div className="filter">
            <FilterButton
              categories={categories}
              onCategoryChange={handleCategoryChange}
            />
          </div>
          <SearchBar onSelect={handleSelectBusiness} />
        </div>
        <div className="user-icon">
          <i className="fa-regular fa-user"></i>
        </div>
      </nav>
    </header>
  );
};

export default MainHeader;
