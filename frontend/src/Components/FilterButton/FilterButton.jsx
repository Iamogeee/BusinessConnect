import React, { useEffect, useState } from "react";

const FilterButton = ({ onCategoryChange, categories }) => {
  return (
    <div>
      <select onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">All Categories</option>
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
