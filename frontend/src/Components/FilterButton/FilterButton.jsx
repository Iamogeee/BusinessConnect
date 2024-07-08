import React, { useState } from "react";

const FilterButton = ({ categories, onFilter }) => {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleFilterChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleFilterClick = () => {
    onFilter(selectedCategory);
  };

  return (
    <div className="filter-container">
      <select value={selectedCategory} onChange={handleFilterChange}>
        <option value="">Filter</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterButton;
