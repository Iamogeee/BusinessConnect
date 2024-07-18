import React from "react";
import "./BusinessPhotos.css";

const BusinessPhotos = ({ photos }) => {
  const apiKey = import.meta.env.VITE_API_KEY;

  return (
    <div className="business-photos">
      <div className="photos-scroll">
        {photos.map((photo, index) => (
          <div key={index} className="photo-item">
            <img
              src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo}&key=${apiKey}`}
              alt={`Business service ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessPhotos;
