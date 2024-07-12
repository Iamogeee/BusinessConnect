import React, { useState, useEffect, useRef } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSelect, onSearchOnMap }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const latestRequest = useRef(null);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (latestRequest.current) {
      latestRequest.current.abort();
    }

    const controller = new AbortController();
    latestRequest.current = controller;

    try {
      const response = await fetch(
        `http://localhost:3000/api/businesses/search?query=${value}`,
        { signal: controller.signal }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await response.json();
      setResults(data);
      setShowDropdown(true);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        setResults([]);
        setShowDropdown(false);
      }
    }
  };

  const handleResultClick = (result) => {
    setQuery(result.name);
    setShowDropdown(false);
    onSelect(result);
  };

  const handleSearchOnMapClick = () => {
    setShowDropdown(false);
    onSearchOnMap(query);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for businesses..."
        className="search-input"
      />
      <button className="search-button">
        <i className="fa fa-search"></i>
      </button>
      {showDropdown && results.length > 0 && (
        <ul className="search-dropdown">
          {results.map((result) => (
            <li
              key={result.placeId}
              onClick={() => handleResultClick(result)}
              className="search-result"
            >
              {result.name}
            </li>
          ))}
          <li onClick={handleSearchOnMapClick} className="search-result">
            Search on Map
          </li>
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
