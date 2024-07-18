import React from "react";
import "./BusinessListSkeleton.css";

const BusinessListSkeleton = () => {
  const SkeletonCard = () => {
    return (
      <div className="skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-text title"></div>
        <div className="skeleton-text subtitle"></div>
        <div className="skeleton-actions">
          <div className="skeleton-icon"></div>
          <div className="skeleton-icon"></div>
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
      </div>
      <div className="skeleton-container">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </>
  );
};

export default BusinessListSkeleton;
