import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BusinessPhotos from "../BusinessPhotos/BusinessPhotos";
import BusinessOverview from "../BusinessOverview/BusinessOverview";
import BusinessReviews from "../BusinessReviews/BusinessReviews";
import BusinessHours from "../BusinessHours/BusinessHours";
import ReviewsModal from "../ReviewsModal/ReviewsModal";
import Modal from "../Modal/Modal";
import ReviewForm from "../ReviewForm/ReviewForm";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import "./BusinessDetails.css";

const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_API_KEY;

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
  const parseLocation = (location) => {
    const [lat, lng] = location
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    return { lat, lng };
  };

  const handleClick = (event) => {};

  return (
    <div className="business-details">
      {business && (
        <>
          <h1>{business.name}</h1>

          <BusinessPhotos photos={business.photos} />
          <div>
            <BusinessOverview overview={business.overview} />
          </div>
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
            <div className="business-section business-map">
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultZoom={20}
                  defaultCenter={parseLocation(business.location)}
                  mapId={"218a557688af104"}
                >
                  <AdvancedMarker
                    position={parseLocation(business.location)}
                    clickable={true}
                    onClick={handleClick}
                  >
                    <Pin
                      background={"#FBBC04"}
                      glyphColor={"#000"}
                      borderColor={"#000"}
                    />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
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
