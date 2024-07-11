import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BusinessPhotos from "../BusinessPhotos/BusinessPhotos";
import BusinessOverview from "../BusinessOverview/BusinessOverview";
import BusinessReviews from "../BusinessReviews/BusinessReviews";
import BusinessHours from "../BusinessHours/BusinessHours";
import ReviewsModal from "../ReviewsModal/ReviewsModal";
import Modal from "../Modal/Modal";
import ReviewForm from "../ReviewForm/ReviewForm";

import "./BusinessDetails.css";

const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetching the details of the selected business from my backend
    const fetchBusinessData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/businesses/${id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setBusiness(data);
      } catch (err) {
        console.error("Error fetching business details:", err);
        setError(err.message);
      }
    };

    fetchBusinessData();
  }, [id]);

  if (error) {
    return <div>Error loading business details: {error}</div>;
  }

  if (!business) {
    return <div>Loading...</div>;
  }

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleReviewFormOpen = () => {
    setShowReviewForm(true);
  };

  const handleReviewFormClose = () => {
    setShowReviewForm(false);
  };

  const handleReviewSubmit = (newReview) => {
    setReviews((prevReviews) => [...prevReviews, newReview]);
    setShowReviewForm(false);
  };

  return (
    <div className="business-details">
      {business && (
        <>
          <h1>{business.name}</h1>
          <BusinessPhotos photos={business.photos} />
          <button
            className="open-review-form-button"
            onClick={handleReviewFormOpen}
          >
            Write a Review
          </button>
          {showReviewForm && (
            <Modal onClose={handleReviewFormClose}>
              <ReviewForm
                businessId={business.id}
                onReviewSubmit={handleReviewSubmit}
              />
            </Modal>
          )}
          <div className="business-main-content">
            <div className="business-section business-overview">
              <BusinessOverview overview={business.overview} />
            </div>
            <div className="business-section business-reviews">
              <BusinessReviews businessId={business.id} reviews={reviews} />
              <button className="open-modal-button" onClick={handleModalOpen}>
                See All Reviews
              </button>
            </div>
            <div className="business-section business-hours">
              <BusinessHours hours={business.businessHours} />
            </div>
          </div>
          {showModal && (
            <ReviewsModal businessId={business.id} onClose={handleModalClose} />
          )}
        </>
      )}
    </div>
  );
};

export default BusinessDetails;
