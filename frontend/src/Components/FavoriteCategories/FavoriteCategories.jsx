import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Favoritecategories.css";

const FavoriteCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [preferredRating, setPreferredRating] = useState(0); // Default to 0 to include all ratings
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      return storedUser ? storedUser : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/categories");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (category) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((cat) => cat !== category)
        : [...prevSelected, category]
    );
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:3000/save-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          categories: selectedCategories,
          preferredRating: parseFloat(preferredRating),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Updating the user in localStorage to reflect that categories have been selected
      const updatedUser = {
        ...user,
        hasSelectedCategories: true,
        preferredRating: parseFloat(preferredRating),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      navigate("/home");
    } catch (error) {
      console.error("Error saving categories:", error);
    }
  };

  return (
    <div className="favorite-categories">
      {user && <h1>Hi {user.name}!</h1>}
      <p>What are your business interests?</p>
      <div className="categories-container">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategories.includes(category) ? "selected" : ""}`}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="preferred-rating">
        <label htmlFor="preferredRating">Preferred Rating and Above:</label>
        <input
          type="number"
          id="preferredRating"
          name="preferredRating"
          value={preferredRating}
          onChange={(e) => setPreferredRating(e.target.value)}
          min="0"
          max="5"
          step="0.5"
        />
      </div>
      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  );
};

export default FavoriteCategories;
