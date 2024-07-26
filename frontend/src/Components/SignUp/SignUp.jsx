import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";

const citiesInCalifornia = [
  "Los Angeles",
  "San Diego",
  "San Jose",
  "San Francisco",
  "Fresno",
  "Sacramento",
  "Menlo Park",
  "Palo Alto",
  "Mountain View",
  "Sunnyvale",
];

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, location: city }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Sign-up failed");
        return;
      }

      const userData = await response.json();

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // Navigating to the login page after successful sign-up
      navigate("/login");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-form">
        <h1>Sign Up</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="city">City</label>
            <select
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            >
              <option value="">Select your city</option>
              {citiesInCalifornia.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
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
