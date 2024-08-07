import React, { useState, useEffect } from "react";
import Message from "./Message";
import "./Chat.css";

const Chat = ({ businessId, reviewId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/messages/${receiverId}/${businessId}/${reviewId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }

    fetchMessages();
  }, [businessId, reviewId, receiverId, token]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const message = {
      text: newMessage,
      senderId: user.id,
      receiverId,
      businessId,
      reviewId,
    };

    try {
      const response = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages((prevMessages) => [...prevMessages, sentMessage]);
        setNewMessage("");
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.senderId === user.id ? "sent" : "received"}`}
          >
            <Message msg={msg} currentUser={user} token={token} />
          </div>
        ))}
      </div>
      {(messages.length > 0 || user.id !== receiverId) && (
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage} className="send-button">
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
