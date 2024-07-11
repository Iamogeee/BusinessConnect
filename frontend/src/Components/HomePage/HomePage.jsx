import React, { useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import "./HomePage.css";
import BusinessList from "../BusinessList/BusinessList";

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      return storedUser ? storedUser : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  return (
    <div className="home-page">
      <MainHeader onCategoryChange={setSelectedCategory} />
      <main>
        {user && <h2>Welcome, {user.name}!</h2>}
        <h2>Discover Local Businesses</h2>
        <BusinessList selectedCategory={selectedCategory} />
      </main>
    </div>
  );
};

export default HomePage;
