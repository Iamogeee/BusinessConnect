import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessList.css";

const BusinessList = ({ selectedCategory }) => {
  const [businesses, setBusinesses] = useState([]);
  const [groupedBusinesses, setGroupedBusinesses] = useState({});
  const apiKey = import.meta.env.VITE_API_KEY;

  const navigate = useNavigate();

  const handleClick = (business) => {
    navigate(`/business/${business.id}`);
  };

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
        const response = await fetch("http://localhost:3000/api/businesses");
        const data = await response.json();
        setBusinesses(data);
        groupBusinessesByCategory(data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchBusinesses();
  }, []);

  const renderBusinesses = (businessList) => (
    <div className="business-list">
      {businessList.map((business) => (
        <div
          onClick={() => handleClick(business)}
          key={business.placeId}
          className="business-card"
        >
          <img
            src={
              business.photoReference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${business.photoReference}&key=${apiKey}`
                : "frontend/src/assets/image.png"
            }
            alt={business.name}
            className="business-photo"
          />
          <h3 className="business-name">{business.name}</h3>
          <p className="business-rating">Rating: {business.averageRating}</p>
        </div>
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

  return !selectedCategory || selectedCategory === "All Categories"
    ? renderCategoryGroups()
    : renderSelectedCategory();
};

export default BusinessList;
