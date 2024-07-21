import React, { useEffect, useState } from "react";
import "./ReviewsModal.css";
import Chat from "../Chat/Chat";

const ReviewsModal = ({ businessId, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const defaultProfilePhoto =
    "http://localhost:3000/default-profile-photo.jpeg";

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
                src={
                  review.profilePhoto
                    ? `http://localhost:3000/${review.profilePhoto}`
                    : defaultProfilePhoto
                }
                alt={`${review.name}'s profile`}
              />
              <div>
                <p>
                  <strong>{review.name}</strong>: {review.reviewText}
                </p>
                <p>Rating: {review.rating}</p>
                {review.userId && review.userId != user.id && (
                  <Chat receiverId={review.userId} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReviewsModal;
