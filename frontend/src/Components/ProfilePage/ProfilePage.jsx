import React, { useState, useEffect, useMemo } from "react";
import Modal from "../Modal/Modal";
import SideBar from "../SideBar/SideBar";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./ProfilePage.css";
import UserReviews from "../UserReviews/UserReviews";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    location: "",
    bio: "",
    interests: "",
    profilePicture: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [pinnedServices, setPinnedServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:3000/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setPinnedServices(data.pinnedServices || []);
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, []);
  useEffect(() => {
    const fetchReviews = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      try {
        const response = await fetch(
          `http://localhost:3000/api/myreviews/${user.id}`
        );
        const data = await response.json();

        setReviews(data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchReviews();
  }, [profile]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const selectedFileURL = useMemo(() => {
    return selectedFile ? URL.createObjectURL(selectedFile) : null;
  }, [selectedFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("location", profile.location);
      formData.append("bio", profile.bio);
      formData.append("interests", profile.interests);
      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      const response = await fetch("http://localhost:3000/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}`);
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsModalOpen(false); // Close the modal on successful update
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="profile-page">
      <button
        className={`sidebar-button-modern ${isSidebarOpen ? "hidden" : "visible"}`}
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open Sidebar"
      >
        <i className="fas fa-bars"></i>
      </button>
      <div className="profile-card">
        <div className="profile-picture">
          <img
            src={
              profile.profilePicture
                ? `http://localhost:3000/${profile.profilePicture}`
                : "http://localhost:3000/default-profile-photo.jpeg"
            }
            alt="Profile"
          />
        </div>
        <div className="profile-info">
          <h2>{profile.name}</h2>
          {profile.location && <p>Location: {profile.location}</p>}
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Edit profile"
          >
            <i className="fas fa-edit"></i>
          </button>
        </div>
        <Tabs>
          <TabList>
            <Tab>Bio</Tab>

            <Tab>Reviews</Tab>
          </TabList>

          <TabPanel>
            <div className="profile-bio">
              <h3>Bio</h3>
              <p>{profile.bio || "N/A"}</p>
              <h3>Interests</h3>
              <p>{profile.interests || "N/A"}</p>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="profile-reviews">
              <UserReviews reviews={reviews} />
            </div>
          </TabPanel>
        </Tabs>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {selectedFile && (
                <img
                  src={selectedFileURL}
                  alt="Selected"
                  className="selected-profile-picture"
                />
              )}
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={profile.location || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio || ""}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="form-group">
              <label>Interests</label>
              <textarea
                name="interests"
                value={profile.interests || ""}
                onChange={handleChange}
              ></textarea>
            </div>
            <button type="submit" className="update-button">
              Update Profile
            </button>
          </form>
        </Modal>
      )}

      <SideBar
        userId={profile.id}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
