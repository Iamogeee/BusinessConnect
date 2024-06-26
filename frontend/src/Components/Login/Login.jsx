import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

function Login() {
  return (
    <div className="login-wrapper">
      <div className="login-form">
        <h1>Login</h1>
        <form>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Type your username"
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

          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
        <div className="sign-up-link">
          <p>
            Or Sign Up Using <Link to="/signup">SIGN UP</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
