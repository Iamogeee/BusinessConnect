import React from "react";
import MainHeader from "../MainHeader/MainHeader";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <MainHeader />
      <main>
        <h2>Discover Local Businesses</h2>
        <p>Find the best services and businesses in your area.</p>
      </main>
    </div>
  );
};

export default HomePage;
