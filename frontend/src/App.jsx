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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
