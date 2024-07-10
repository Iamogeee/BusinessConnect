import React, { useState } from "react";
import "./ReviewForm.css";

const ReviewForm = ({ businessId, onReviewSubmit }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const review = {
      businessId,
      rating,
      reviewText,
      name: user.name,
      profilePhoto: "frontend/src/assets/image.png", // Default profile photo
    };

    try {
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const savedReview = await response.json();
      onReviewSubmit(savedReview);
      handleReviewAndRating(businessId);
      setReviewText("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleReviewAndRating = async (businessId) => {
    // Logic for tracking ratings and reviews

    try {
      await fetch("http://localhost:3000/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          reviewed: reviewText,
          userId: user.id,
          rated: rating,
        }),
      });
    } catch (error) {
      console.error("Error saving business:", error);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Write your review here..."
        required
      />
      <input
        type="number"
        value={rating}
        onChange={(e) => setRating(parseInt(e.target.value))}
        placeholder="Rating (1-5)"
        min="1"
        max="5"
        required
      />
      <button type="submit">Submit Review</button>
    </form>
  );
};

export default ReviewForm;
