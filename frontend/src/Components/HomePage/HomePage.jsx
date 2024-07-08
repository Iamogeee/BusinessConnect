import React, { useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import "./HomePage.css";
import BusinessList from "../BusinessList/BusinessList";

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <div className="home-page">
      <MainHeader onCategoryChange={setSelectedCategory} />
      <main>
        <h2>Discover Local Businesses</h2>
        <p>Find the best services and businesses in your area.</p>
        <BusinessList selectedCategory={selectedCategory} />
      </main>
    </div>
  );
};

export default HomePage;
