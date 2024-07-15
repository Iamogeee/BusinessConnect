import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const MapComponent = ({ apiKey, businesses }) => {
  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {businesses.map((business) => (
          <Marker
            key={business.id}
            position={{ lat: business.latitude, lng: business.longitude }}
            title={business.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
