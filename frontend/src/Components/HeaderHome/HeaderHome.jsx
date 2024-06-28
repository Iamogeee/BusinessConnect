import React from "react";
import { Link } from "react-router-dom";
import "./HeaderHome.css";

function HeaderHome() {
  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          Business <span>Connect</span>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default HeaderHome;
