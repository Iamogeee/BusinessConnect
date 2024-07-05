import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BusinessPhotos from "../BusinessPhotos/BusinessPhotos";
import BusinessOverview from "../BusinessOverview/BusinessOverview";
import BusinessReviews from "../BusinessReviews/BusinessReviews";
import BusinessHours from "../BusinessHours/BusinessHours";

import "./BusinessDetails.css";

const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    // Fetching the details of the selected business from my backend
    fetch(`http://localhost:3000/api/businesses/${id}`)
      .then((response) => response.json())
      .then((data) => setBusiness(data));
  }, [id]);

  if (!business) {
    return <div>Loading...</div>;
  }

  return (
    <div className="business-details">
      <h1>{business.name}</h1>
      <BusinessPhotos photos={business.photos} />
      <BusinessOverview overview={business.overview} />
      <BusinessReviews businessId={business.id} />
      <BusinessHours hours={business.businessHours} />
    </div>
  );
};

export default BusinessDetails;
