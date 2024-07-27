import React, { useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import BusinessList from "../BusinessList/BusinessList";

const FavoriteBusinesses = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="home-page">
      <MainHeader onCategoryChange={setSelectedCategory} />
      <main>
        <h2>Favorites</h2>
        {user && (
          <BusinessList
            apiEndpoint={`http://localhost:3000/api/favorites/${user.id}`}
            selectedCategory={selectedCategory}
          />
        )}
      </main>
    </div>
  );
};

export default FavoriteBusinesses;
