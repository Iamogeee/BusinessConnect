import React, { useEffect, useState } from "react";
import "./BusinessCard.css";

const BusinessCard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/businesses");
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.results);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        setError("Failed to fetch data");
      }
    };

    fetchBusinessData();
  }, []);

  const apiKey = import.meta.env.VITE_API_KEY;

  return (
    <div className="business-categories">
      {error && <p className="error-message">{error}</p>}
      {Object.keys(businesses).map((category) => (
        <div key={category} className="business-category">
          <h1 className="category-title">{category}</h1>
          <div className="business-cards">
            {businesses[category].map((business) => (
              <div key={business.place_id} className="business-card">
                <img
                  src={
                    business.photos && business.photos.length > 0
                      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${business.photos[0].photo_reference}&key=${apiKey}`
                      : "default-image-url" //Default image URL in case there's no photoReference
                  }
                  alt={business.name}
                  className="business-photo"
                />
                <h3 className="business-name">{business.name}</h3>
                <p className="business-rating">Rating: {business.rating}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusinessCard;
