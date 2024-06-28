import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <div className="login-wrapper">
      <div className="login-form">
        <h1>Login</h1>
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
        <div className="sign-up-link">
          <p>
            New User? <Link to="/signup">SIGN UP</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
