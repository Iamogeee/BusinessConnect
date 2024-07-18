import React, { useEffect, useState } from "react";
import "./BusinessHeader.css";

const BusinessHeader = ({
  name,
  description,
  photos,
  contact,
  rating,
  types,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === photos.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, [photos.length]);

  const formatBusinessTypes = (types) => {
    return types
      .split(",")
      .map((type) =>
        type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
      )
      .join(", ");
  };

  const renderRatingIcons = (rating) => {
    const filledIcons = Math.floor(rating);
    const emptyIcons = 5 - filledIcons;
    return (
      <>
        {[...Array(filledIcons)].map((_, i) => (
          <i key={i} className="fas fa-star filled"></i>
        ))}
        {[...Array(emptyIcons)].map((_, i) => (
          <i key={i} className="fas fa-star"></i>
        ))}
      </>
    );
  };

  return (
    <div className="business-header">
      <div className="business-overlay">
        <h1>{name}</h1>
        <p>{description}</p>
        <div className="business-info">
          <p>
            <strong>Contact:</strong> {contact}
          </p>
          <p>
            <strong>Rating:</strong> {renderRatingIcons(rating)}
          </p>
          <p>
            <strong>Types:</strong> {formatBusinessTypes(types)}
          </p>
        </div>
      </div>
      <div
        className="business-backdrop"
        style={{ backgroundImage: `url(${photos[currentIndex]})` }}
      ></div>
    </div>
  );
};

export default BusinessHeader;
