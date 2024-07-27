import React from "react";
import BusinessList from "../BusinessList/BusinessList";

const Recommendations = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <BusinessList
      title="Recommended"
      fetchBusinessesUrl={`http://localhost:3000/recommendations/${user.id}`}
      userId={user.id}
    />
  );
};

export default Recommendations;
