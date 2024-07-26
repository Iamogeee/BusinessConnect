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
  const [direction, setDirection] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [photos.length]);

  const goToNext = () => {
    setDirection("next");
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setDirection("prev");
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

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
      <button className="carousl-control prev" onClick={goToPrevious}>
        <i className="fas fa-chevron-left"></i>
      </button>
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
      <div className="carousl">
        <div
          className={`carousl-inner ${direction}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {photos.map((photo, index) => (
            <div
              key={index}
              className="carousl-item"
              style={{ backgroundImage: `url(${photo})` }}
            ></div>
          ))}
        </div>
      </div>
      <button className="carousl-control next" onClick={goToNext}>
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default BusinessHeader;
