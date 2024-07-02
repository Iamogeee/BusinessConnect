import React from "react";
import "./MainHeader.css";
import SearchBar from "../SearchBar/SearchBar";

const MainHeader = () => {
  return (
    <header className="header">
      <div className="logo">
        <h1>
          BUSINESS <span>Connect</span>
        </h1>
      </div>
      <nav>
        <button className="discover-button">Discover</button>
        <div className="filter-search">
          <div className="filter">
            Filter
            <span className="dropdown-icon">▼</span>
          </div>
          <SearchBar />
        </div>
        <div className="user-icon">
          <i className="fa-regular fa-user"></i>
        </div>
      </nav>
    </header>
  );
};

export default MainHeader;
