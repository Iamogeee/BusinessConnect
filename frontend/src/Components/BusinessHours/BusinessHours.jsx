import React from "react";
import "./BusinessHours.css";

const BusinessHours = ({ hours }) => {
  return (
    <div className="business-hours">
      <h2>Business Hours</h2>
      <ul>
        {hours.map((hour, index) => (
          <li key={index}>{hour}</li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessHours;
