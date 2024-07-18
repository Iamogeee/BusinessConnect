import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Login from "./Components/Login/Login";
import SignUp from "./Components/SignUp/SignUp";
import LandingPage from "./Components/LandingPage/LandingPage";
import HomePage from "./Components/HomePage/HomePage";
import Footer from "./Components/Footer/Footer";
import BusinessDetails from "./Components/BusinessDetails/BusinessDetails";
import FavoriteBusinesses from "./Components/FavoriteBusinesses/FavoriteBusinesses";
import FavoriteCategories from "./Components/FavoriteCategories/FavoriteCategories";
import Recommendations from "./Components/Recommendations/Recommendations";
import SavedBusinesses from "./Components/SavedBusinesses/SavedBusinesses";
// import ProfilePage from "./Components/ProfilePage/ProfilePage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/business/:id" element={<BusinessDetails />} />
          <Route path="/favorites" element={<FavoriteBusinesses />} />
          <Route path="/saved" element={<SavedBusinesses />} />
          <Route path="/interests" element={<FavoriteCategories />} />
          <Route path="/recommendations/:id" element={<Recommendations />} />
          {/* <Route path="/profile" element={<ProfilePage />} /> */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
