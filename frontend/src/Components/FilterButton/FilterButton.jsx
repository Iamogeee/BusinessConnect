import React, { useEffect, useState } from "react";

const FilterButton = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const formatBusinessTypes = (types) => {
    return types.map((type) =>
      type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("http://localhost:3000/api/categories");
      const data = await response.json();
      setCategories(data);
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <select onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>
            {category
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterButton;
