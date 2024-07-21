import React, { useState, useEffect } from "react";
import "./Chat.css";

const Chat = ({ receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/messages/${receiverId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, [receiverId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, receiverId }),
    });

    if (response.ok) {
      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setText("");
    } else {
      console.error("Failed to send message");
    }
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.senderId === receiverId ? "received" : "sent"}`}
          >
            <p>{message.text}</p>
            <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="chat-input">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
