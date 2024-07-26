import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserReviews.css";

const UserReviews = ({ reviews }) => {
  const [businesses, setBusinesses] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetching the details of the selected business from the backend
  const fetchBusinessData = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/businesses/${id}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching business details:", err);
      setError(err.message);
      return null;
    }
  };

  const handleBusinessClick = (id) => {
    navigate(`/business/${id}`);
  };

  useEffect(() => {
    const loadBusinesses = async () => {
      const businessData = {};
      for (const review of reviews) {
        if (!businessData[review.businessId]) {
          const business = await fetchBusinessData(review.businessId);
          if (business) {
            businessData[review.businessId] = business;
          }
        }
      }
      setBusinesses(businessData);
    };

    loadBusinesses();
  }, [reviews]);

  return (
    <div className="shadow rounded-lg p-3">
      <h2>User Reviews</h2>
      {error && <p>Error: {error}</p>}
      {reviews.length === 0 ? (
        <p>No reviews available.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <div className="card" key={review.id}>
              <div className="card-header">
                <h3
                  onClick={() => handleBusinessClick(review.businessId)}
                  className="business-name cursor-pointer"
                >
                  {businesses[review.businessId]?.name || ""}
                </h3>
              </div>
              <div className="card-body">
                <p>{review.reviewText}</p>
              </div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserReviews;
