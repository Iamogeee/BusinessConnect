import React from "react";
import "./BusinessOverview.css";

const BusinessOverview = ({ overview }) => {
  return (
    <div className="business-overview">
      <h2>Overview</h2>
      <p>{overview}</p>
    </div>
  );
};

export default BusinessOverview;
