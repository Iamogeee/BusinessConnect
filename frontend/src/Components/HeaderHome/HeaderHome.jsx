import React from "react";
import { Link } from "react-router-dom";
import "./HeaderHome.css";
import Logo from "../../assets/BCLogo.png";

function HeaderHome() {
  return (
    <header class="mb-auto bg-body-tertiary">
      <div className="d-flex">
        <h3 class="float-md-start  mb-0">
          <Link to="/home">
            <img
              src={Logo}
              alt="Business Connect Logo"
              className="logo-image"
            />
          </Link>
        </h3>
        <nav class="nav nav-masthead d-flex justify-content-end float-md-end">
          <div
            class="nav-link fw-bold py-1 px-3 active"
            aria-current="page"
            href="#"
          >
            <Link to="/">Home</Link>
          </div>
          <div class="nav-link fw-bold py-1 px-3" href="#">
            <Link to="/login">Login</Link>
          </div>
          <div class="nav-link fw-bold py-1 px-3" href="#">
            <Link to="/signup">Sign Up</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default HeaderHome;
