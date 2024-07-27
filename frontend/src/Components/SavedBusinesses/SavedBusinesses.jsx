import React, { useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import BusinessList from "../BusinessList/BusinessList";

const SavedBusinesses = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="home-page">
      <MainHeader onCategoryChange={setSelectedCategory} />
      <main>
        <h2>Saved Businesses</h2>
        {user && (
          <BusinessList
            apiEndpoint={`http://localhost:3000/api/saved/${user.id}`}
            selectedCategory={selectedCategory}
          />
        )}
      </main>
    </div>
  );
};

export default SavedBusinesses;
