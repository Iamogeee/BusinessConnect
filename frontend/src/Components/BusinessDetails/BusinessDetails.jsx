import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BusinessPhotos from "../BusinessPhotos/BusinessPhotos";
import BusinessOverview from "../BusinessOverview/BusinessOverview";
import BusinessReviews from "../BusinessReviews/BusinessReviews";
import BusinessHours from "../BusinessHours/BusinessHours";
import ReviewsModal from "../ReviewsModal/ReviewsModal";

import "./BusinessDetails.css";

const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetching the details of the selected business from my backend
    fetch(`http://localhost:3000/api/businesses/${id}`)
      .then((response) => response.json())
      .then((data) => setBusiness(data));
  }, [id]);

  if (!business) {
    return <div>Loading...</div>;
  }

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="business-details">
      {business && (
        <>
          <h1>{business.name}</h1>
          <BusinessPhotos photos={business.photos} />
          <div className="business-main-content">
            <div className="business-section business-overview">
              <BusinessOverview overview={business.overview} />
            </div>
            <div className="business-section business-reviews">
              <BusinessReviews businessId={business.id} />
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
