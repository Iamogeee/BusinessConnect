import React, { useEffect, useState } from "react";
import "./ReviewsModal.css";

const ReviewsModal = ({ businessId, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const defaultProfilePhoto = "frontend/src/assets/image.png";

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await fetch(
        `http://localhost:3000/api/reviews/${businessId}`
      );
      const data = await response.json();
      setReviews(data);
    };

    fetchReviews();
  }, [businessId]);

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Reviews</h2>
        <ul className="reviews-list">
          {reviews.map((review) => (
            <li key={review.id} className="review-item">
              <img
                src={review.profilePhoto || defaultProfilePhoto}
                alt={`${review.name}'s profile`}
              />
              <div>
                <p>
                  <strong>{review.name}</strong>: {review.reviewText}
                </p>
                <p>Rating: {review.rating}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReviewsModal;
