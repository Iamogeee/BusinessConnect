import React from "react";
import "./MainHeader.css";

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
          <input type="text" placeholder="Search" className="search-input" />
          <button className="search-button">
            <img src="" alt="search" />
          </button>
        </div>
        <div className="user-icon">
          <img src="" alt="user" />
        </div>
      </nav>
    </header>
  );
};

export default MainHeader;
