import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessCard.css";

const BusinessCard = ({ businesses: initialBusinesses }) => {
  const [businesses, setBusinesses] = useState(initialBusinesses || []);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClick = (business) => {
    navigate(`/business/${business.id}`);
  };

  useEffect(() => {
    if (!initialBusinesses) {
      const fetchBusinessData = async () => {
        try {
          const response = await fetch("http://localhost:3000/api/businesses");

          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }

          const data = await response.json();
          setBusinesses(data);
        } catch (err) {
          setError("Failed to fetch data");
          console.error(err);
        }
      };

      fetchBusinessData();
    }
  }, [initialBusinesses]);

  const apiKey = import.meta.env.VITE_API_KEY;

  return (
    <div className="business-cards">
      {error && <p className="error-message">{error}</p>}
      {businesses.map((business) => (
        <div
          onClick={() => {
            handleClick(business);
          }}
          key={business.placeId}
          className="business-card"
        >
          <img
            src={
              business.photoReference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${business.photoReference}&key=${apiKey}`
                : "frontend/src/assets/image.png" // Default image URL in case there's no photoReference
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
};

export default BusinessCard;
