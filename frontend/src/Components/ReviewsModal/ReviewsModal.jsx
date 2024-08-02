import React, { useEffect, useState } from "react";
import "./ReviewsModal.css";
import Chat from "../Chat/Chat";
async function fetchUserPhoto(id, token) {
  const response = await fetch(`http://localhost:3000/api/user/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await response.json();
  return user.profilePicture;
}
function Photo({ review, token }) {
  const [photo, setPhoto] = useState(
    "http://localhost:3000/default-profile-photo.jpeg"
  );

  useEffect(() => {
    let isMounted = true;

    async function getUserPhoto() {
      if (review.userId) {
        const photo = await fetchUserPhoto(review.userId, token);

        if (isMounted && photo) {
          setPhoto("http://localhost:3000/" + photo);
        }
      } else {
        setPhoto(review.profilePhoto);
      }
    }

    getUserPhoto();

    return () => {
      isMounted = false;
    };
  }, [review.userId, token]);

  return <img src={photo} alt={`${review.name}'s profile`} />;
}

const ReviewsModal = ({ businessId, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const defaultProfilePhoto =
    "http://localhost:3000/default-profile-photo.jpeg";

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await fetch(
        `http://localhost:3000/api/reviews/${businessId}`
      );
      const data = await response.json();
      setReviews(data);
    };

    fetchReviews();
  }, [businessId]);

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Reviews</h2>
        <ul className="reviews-list">
          {reviews.map((review) => (
            <li key={review.id} className="review-item">
              <Photo review={review} token={token} />
              <div>
                <p>
                  <strong>{review.name}</strong>: {review.reviewText}
                </p>
                <p>Rating: {review.rating}</p>
                {review.userId && (
                  <Chat
                    receiverId={review.userId}
                    businessId={businessId}
                    reviewId={review.id}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReviewsModal;
