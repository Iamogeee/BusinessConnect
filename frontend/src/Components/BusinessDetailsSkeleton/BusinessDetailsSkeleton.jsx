import React from "react";
import "./BusinessDetailsSkeleton.css";

const BusinessDetailsSkeleton = () => {
  return (
    <div className="business-details-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-Image shimmer"></div>

        <button className="skeleton-button shimmer"></button>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-map shimmer"></div>
        <div className="skeleton-reviews">
          <div className="skeleton-title shimmer"></div>
          <div className="skeleton-review shimmer"></div>
          <div className="skeleton-review shimmer"></div>
          <div className="skeleton-review shimmer"></div>
          <button className="skeleton-button shimmer"></button>
        </div>
        <div className="skeleton-hours">
          <div className="skeleton-title shimmer"></div>
          <div className="skeleton-hour shimmer"></div>
          <div className="skeleton-hour shimmer"></div>
          <div className="skeleton-hour shimmer"></div>
          <div className="skeleton-hour shimmer"></div>
          <div className="skeleton-hour shimmer"></div>
          <div className="skeleton-hour shimmer"></div>
          <div className="skeleton-hour shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsSkeleton;
