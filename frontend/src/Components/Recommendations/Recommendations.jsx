import React, { useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import BusinessList from "../BusinessList/BusinessList";

const Recommendations = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="home-page">
      <MainHeader onCategoryChange={setSelectedCategory} userId={user?.id} />
      <main>
        <h2>Recommended Businesses</h2>
        {user && (
          <BusinessList
            apiEndpoint={`http://localhost:3000/recommendations/${user.id}`}
            selectedCategory={selectedCategory}
          />
        )}
      </main>
    </div>
  );
};

export default Recommendations;
