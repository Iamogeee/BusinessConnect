import React from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessCard.css";

const BusinessCard = ({ business, apiKey, onLike, onSave, onClick }) => {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/business/${business.id}`);
    onClick(business.id); // Tracking clicks/views
  };

  return (
    <div className="business-card">
      <img
        src={
          business.photoReference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${business.photoReference}&key=${apiKey}`
            : "frontend/src/assets/image.png"
        }
        alt={business.name}
        className="business-photo"
      />
      <h3 className="business-name" onClick={handleDetailsClick}>
        {business.name}
      </h3>
      <p className="business-rating">Rating: {business.averageRating}</p>
      <div className="business-actions">
        <button onClick={() => onLike(business.id)}>Like</button>
        <button onClick={() => onSave(business.id)}>Save</button>
      </div>
    </div>
  );
};

export default BusinessCard;
