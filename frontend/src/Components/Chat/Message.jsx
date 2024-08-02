import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Helper function to fetch user data
async function fetchUserName(id, token) {
  const response = await fetch(`http://localhost:3000/api/user/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await response.json();
  return user.name;
}

function Message({ msg, currentUser, token }) {
  const [senderName, setSenderName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function getUserName() {
      if (msg.senderId !== currentUser.id) {
        const name = await fetchUserName(msg.senderId, token);
        if (isMounted) {
          setSenderName(name);
        }
      } else {
        setSenderName("You");
      }
    }

    getUserName();

    return () => {
      isMounted = false;
    };
  }, [msg.senderId, currentUser.id, token]);

  return (
    <p>
      <strong>{senderName}:</strong> {msg.text}
    </p>
  );
}

Message.propTypes = {
  msg: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
};

export default Message;
