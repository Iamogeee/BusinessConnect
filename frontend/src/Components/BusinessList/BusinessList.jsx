import React, { useEffect, useState } from "react";
import "./BusinessList.css";
import BusinessCard from "../BusinessCard/BusinessCard";
import BusinessListSkeleton from "../BusinessListSkeleton/BusinessListSkeleton";

const BusinessList = ({ apiEndpoint, selectedCategory }) => {
  const [businesses, setBusinesses] = useState([]);
  const [groupedBusinesses, setGroupedBusinesses] = useState({});
  const [loading, setLoading] = useState(true);
  const apiKey = import.meta.env.VITE_API_KEY;
  const user = JSON.parse(localStorage.getItem("user"));

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
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        setBusinesses(data);
        groupBusinessesByCategory(data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [apiEndpoint]);

  const handleLike = async (businessId) => {
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
          like={
            business.interaction?.liked ??
            business.interactions.some(
              (interaction) =>
                interaction.userId === user.id && interaction.liked
            )
          }
          save={
            business.interaction?.saved ??
            business.interactions.some(
              (interaction) =>
                interaction.userId === user.id && interaction.saved
            )
          }
        />
      ))}
    </div>
  );

  const renderCategoryGroups = () => (
    <>
      {Object.keys(groupedBusinesses).map((category) => (
        <div key={category} className="category-group">
          <h3>
            {category
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </h3>
          {renderBusinesses(groupedBusinesses[category])}
        </div>
      ))}
    </>
  );

  const renderSelectedCategory = () => {
    const businessesInCategory = groupedBusinesses[selectedCategory] || [];
    return (
      <div className="category-group">
        <h3>
          {selectedCategory
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())}
        </h3>
        {renderBusinesses(businessesInCategory)}
      </div>
    );
  };

  if (loading) {
    return <BusinessListSkeleton />;
  }

  return !selectedCategory || selectedCategory === "All Categories"
    ? renderCategoryGroups()
    : renderSelectedCategory();
};

export default BusinessList;
