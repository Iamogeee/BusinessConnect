import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import HeaderHome from "../HeaderHome/HeaderHome";

function LandingPage() {
  return (
    <div className="landing-page">
      <HeaderHome />
      <div className="landing-page-content">
        <h1>
          Your Gateway To
          <br /> The Best and Trusted Local Services
        </h1>
        <p>Discover, Engage, and Save!</p>
        <div className="landing-page-buttons">
          <Link to="/signup" className="signup-button">
            SIGN UP NOW
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
