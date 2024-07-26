import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import HeaderHome from "../HeaderHome/HeaderHome";
import background from "../../assets/backgroundImage.png";

function LandingPage() {
  return (
    <div class="cover-container d-flex w-100 h-100   flex-column">
      <HeaderHome />

      <div class="container col-xxl-8 px-4 py-5">
        <div class="row flex-lg-row-reverse align-items-center g-5 py-5">
          <div class="col-10 col-sm-8 col-lg-6 landing-page">
            <img
              src={background}
              class="d-block mx-lg-auto img-fluid"
              alt="Bootstrap Themes"
              width="700"
              height="500"
              loading="lazy"
            />
          </div>
          <div class="col-lg-6 landing-page">
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
      </div>
    </div>
  );
}
export default LandingPage;
