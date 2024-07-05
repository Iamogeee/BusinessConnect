import React, { useEffect, useState } from "react";
import "./BusinessReviews.css";

const BusinessReviews = ({ businessId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetching the reviews for the given business ID
    fetch(`http://localhost:3000/api/reviews/${businessId}`)
      .then((response) => response.json())
      .then((data) => {
        setReviews(data);
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  }, [businessId]);

  if (!reviews.length) {
    return <div>No reviews found for this business.</div>;
  }

  return (
    <div className="business-reviews">
      <h2>Reviews</h2>
      <div className="review">
        <p>
          <strong>{reviews[0].name}</strong>
        </p>
        <p>{reviews[0].reviewText}</p>
        <p>Rating: {reviews[0].rating}</p>
      </div>
    </div>
  );
};

export default BusinessReviews;
