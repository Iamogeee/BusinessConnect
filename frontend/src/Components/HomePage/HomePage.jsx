import React, { useEffect, useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import "./HomePage.css";
import BusinessCard from "../BusinessCard/BusinessCard";

const HomePage = () => {
  return (
    <div className="home-page">
      <MainHeader />
      <main>
        <h2>Discover Local Businesses</h2>
        <p>Find the best services and businesses in your area.</p>
        <BusinessCard />
      </main>
    </div>
  );
};

export default HomePage;
