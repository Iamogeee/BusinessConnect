import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BusinessOverview from "../BusinessOverview/BusinessOverview";
import BusinessReviews from "../BusinessReviews/BusinessReviews";
import BusinessHours from "../BusinessHours/BusinessHours";
import ReviewsModal from "../ReviewsModal/ReviewsModal";
import Modal from "../Modal/Modal";
import ReviewForm from "../ReviewForm/ReviewForm";
import BusinessHeader from "../BusinessHeader/BusinessHeader";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import "./BusinessDetails.css";
import BusinessDetailsSkeleton from "../BusinessDetailsSkeleton/BusinessDetailsSkeleton";

const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_API_KEY;
  const mapId = import.meta.env.VITE_MAP_ID;
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [loading, setLoading] = useState(false);

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

  if (loading) {
    return <BusinessDetailsSkeleton />;
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

  const location = business ? parseLocation(business.location) : null;

  return (
    <div className="business-details">
      {business && (
        <>
          <BusinessHeader
            name={business.name}
            description={business.overview}
            photos={business.photos.map(
              (photo) =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo}&key=${apiKey}`
            )}
            rating={business.averageRating}
            types={business.businessType}
            contact={business.contactInformation}
          />
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
                <Map defaultZoom={20} defaultCenter={location} mapId={mapId}>
                  <AdvancedMarker
                    ref={markerRef}
                    position={location}
                    clickable={true}
                    onClick={() => setInfoWindowOpen(true)}
                  >
                    {infoWindowOpen && (
                      <InfoWindow
                        anchor={marker}
                        onCloseClick={() => setInfoWindowOpen(false)}
                        position={location}
                      >
                        <div className="info-window-content">
                          <h3>{business.name}</h3>
                          <p>{business.address}</p>
                          <div>{renderRatingIcons(business.averageRating)}</div>

                          <p>Contact: {business.contactInformation}</p>
                        </div>
                      </InfoWindow>
                    )}

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
