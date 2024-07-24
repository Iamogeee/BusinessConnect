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
import ProtectedRoute from "./Components/ProtectedRoutes/ProtectedRoutes";
// import ProfilePage from "./Components/ProfilePage/ProfilePage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<ProtectedRoute element={HomePage} />} />
          <Route
            path="/business/:id"
            element={<ProtectedRoute element={BusinessDetails} />}
          />
          <Route
            path="/favorites"
            element={<ProtectedRoute element={FavoriteBusinesses} />}
          />
          <Route
            path="/saved"
            element={<ProtectedRoute element={SavedBusinesses} />}
          />
          <Route
            path="/interests"
            element={<ProtectedRoute element={FavoriteCategories} />}
          />
          <Route
            path="/recommendations/:id"
            element={<ProtectedRoute element={Recommendations} />}
          />
          {/* <Route
            path="/profile"
            element={<ProtectedRoute element={ProfilePage} />}
          /> */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
