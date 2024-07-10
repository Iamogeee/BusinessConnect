import React, { useEffect, useState } from "react";
import MainHeader from "../MainHeader/MainHeader";
import "./HomePage.css";
import BusinessList from "../BusinessList/BusinessList";

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <div className="home-page">
      <MainHeader onCategoryChange={setSelectedCategory} />
      <main>
        {user && <h2>Welcome, {user.name}!</h2>}
        <h2>Discover Local Businesses</h2>

        <BusinessList selectedCategory={selectedCategory} />
      </main>
    </div>
  );
};

export default HomePage;
