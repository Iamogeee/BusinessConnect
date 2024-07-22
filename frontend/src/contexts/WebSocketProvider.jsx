import React, { createContext, useState, useEffect } from "react";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const newWs = new WebSocket(`ws://localhost:3001?token=${token}`);
      setWs(newWs);

      newWs.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      newWs.onclose = () => {
        console.log("WebSocket connection closed"); //Necessary
      };

      newWs.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      newWs.onopen = () => {
        console.log("WebSocket connected"); //Necessary
      };

      // Clean up the WebSocket connection when the component unmounts
      return () => {
        newWs.close();
      };
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws, messages, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
