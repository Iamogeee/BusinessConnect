import React, { useEffect, useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import "../BusinessList/BusinessList.css";
import BusinessCard from "../BusinessCard/BusinessCard";

const Recommendations = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const [businesses, setBusinesses] = useState([]);
  const [groupedBusinesses, setGroupedBusinesses] = useState({});
  const apiKey = import.meta.env.VITE_API_KEY;

  const groupBusinessesByCategory = (businesses) => {
    const grouped = businesses.reduce((acc, business) => {
      const category = business.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(business);
      return acc;
    }, {});
    setGroupedBusinesses(grouped);
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/recommendations/${user.id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setBusinesses(data);
        groupBusinessesByCategory(data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchBusinesses();
  }, []);

  const handleLike = async (businessId) => {
    // Logic for tracking likes

    try {
      await fetch("http://localhost:3000/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessId, liked: true, userId: user.id }),
      });
    } catch (error) {
      console.error("Error liking business:", error);
    }
  };

  const handleSave = async (businessId) => {
    // Logic for tracking saves

    try {
      await fetch("http://localhost:3000/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessId, saved: true, userId: user.id }),
      });
    } catch (error) {
      console.error("Error saving business:", error);
    }
  };

  const handleClick = async (businessId) => {
    // Logic for tracking buisness views
    try {
      await fetch("http://localhost:3000/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessId, viewed: true, userId: user.id }),
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  const renderBusinesses = (businessList) => (
    <div className="business-list">
      {businessList.map((business) => (
        <BusinessCard
          key={business.placeId}
          business={business}
          apiKey={apiKey}
          onLike={handleLike}
          onSave={handleSave}
          onClick={handleClick}
        />
      ))}
    </div>
  );

  const renderCategoryGroups = () => (
    <>
      {Object.keys(groupedBusinesses).map((category) => (
        <div key={category} className="category-group">
          <h3>{category}</h3>
          {renderBusinesses(groupedBusinesses[category])}
        </div>
      ))}
    </>
  );

  const renderSelectedCategory = () => {
    const businessesInCategory = groupedBusinesses[selectedCategory] || [];
    return (
      <div className="category-group">
        <h3>{selectedCategory}</h3>
        {renderBusinesses(businessesInCategory)}
      </div>
    );
  };

  return (
    <div className="home-page">
      <MainHeader onCategoryChange={setSelectedCategory} />
      <main>
        <h2>Recommended</h2>
        {selectedCategory ? renderSelectedCategory() : renderCategoryGroups()}
      </main>
    </div>
  );
};

export default Recommendations;
