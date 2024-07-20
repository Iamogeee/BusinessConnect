import React, { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

function SearchBar({ userId, onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const fetchSuggestions = debounce(async (input) => {
    if (input.length > 0) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/search?query=${input}&userId=${userId}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, 300);

  const handleChange = (e) => {
    const input = e.target.value;
    setQuery(input);
    fetchSuggestions(input);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setSuggestions([]);
    if (onSelect) {
      onSelect(suggestion);
    }
    navigate(`/business/${suggestion.id}`);
  };

  const clearQuery = () => {
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
        className="search-input"
      />
      {query && <i className="fa fa-times" onClick={clearQuery}></i>}
      <i className="fa fa-search"></i>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="suggestion-item"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
