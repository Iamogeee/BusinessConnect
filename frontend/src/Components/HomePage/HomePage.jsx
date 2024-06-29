import React, { useEffect, useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import "./HomePage.css";

const HomePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/home", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setData(data);
      } else {
        setError("Failed to fetch data");
      }
    };

    fetchHomeData();
  }, []);

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
