import React, { useState, useEffect } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import Chat from "./components/Chat";
import FileUpload from "./components/FileUpload";
import ExportButtons from "./components/ExportButtons";
import { loginRequest } from "./authConfig";

function App() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [messages, setMessages] = useState([]);
  const [apiMessage, setApiMessage] = useState("");

  async function login() {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  async function logout() {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  useEffect(() => {
    async function fetchApiMessage() {
      try {
        const response = await fetch("/api/message");
        const data = await response.json();
        setApiMessage(data.text);
      } catch (error) {
        console.error("Failed to fetch API message:", error);
      }
    }

    if (isAuthenticated) {
      fetchApiMessage();
    }
  }, [isAuthenticated]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Azure Foundry Chat App</h1>
      {isAuthenticated ? (
        <>
          <button onClick={logout}>Logout</button>
          <p><strong>API Message:</strong> {apiMessage || "Loading..."}</p>
          <Chat messages={messages} setMessages={setMessages} />
          <ExportButtons messages={messages} />
        </>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}

export default App;