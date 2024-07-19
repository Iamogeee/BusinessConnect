import React from "react";
import "./BusinessOverview.css";

const BusinessOverview = ({ overview }) => {
  return (
    <div className="business-overview">
      <p>{overview || "Overview not provided"}</p>
    </div>
  );
};

export default BusinessOverview;
