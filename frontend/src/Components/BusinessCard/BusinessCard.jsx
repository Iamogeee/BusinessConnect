import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessCard.css";
import defaultPhoto from "../../assets/businessPlaceholder.jpeg";

const BusinessCard = ({
  business,
  apiKey,
  onLike,
  onSave,
  onClick,
  like,
  save,
}) => {
  const [liked, setLiked] = useState(like);
  const [saved, setSaved] = useState(save);
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/business/${business.id}`);
    onClick(business.id); // Tracking clicks/views
  };

  const handleLike = () => {
    setLiked(!liked);
    onLike(business.id);
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave(business.id);
  };

  return (
    <div className="business-card">
      <img
        src={
          business.photoReference &&
          business.photoReference != "No photo available"
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${business.photoReference}&key=${apiKey}`
            : defaultPhoto
        }
        alt={business.name}
        className="business-photo"
      />
      <h3
        className="business-name fs-5 fw-bold text-emphasis"
        onClick={handleDetailsClick}
      >
        {business.name}
      </h3>
      <p className="business-rating">Rating: {business.averageRating}</p>
      <div className="business-actions">
        <button onClick={handleLike}>
          <i
            className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
            style={{ color: "#dc1818" }}
          ></i>
        </button>
        <button onClick={handleSave}>
          <i
            className={
              saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"
            }
            style={{ color: "#000000" }}
          ></i>
        </button>
      </div>
    </div>
  );
};

export default BusinessCard;
