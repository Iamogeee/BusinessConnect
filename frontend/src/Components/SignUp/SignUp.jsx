import React from "react";
import { Link } from "react-router-dom";
import "./SignUp.css";

function SignUp() {
  return (
    <div className="signup-wrapper">
      <div className="signup-form">
        <h1>Sign Up</h1>
        <form>
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Type your full name"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Type your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Type your password"
            />
          </div>
          <button type="submit" className="signup-button">
            SIGN UP
          </button>
        </form>
        <div className="login-link">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
