import React, { useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import Chat from "./components/Chat";
import FileUpload from "./components/FileUpload";
import ExportButtons from "./components/ExportButtons";
import { loginRequest } from "./authConfig";

function App() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [messages, setMessages] = useState([]);

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Azure Foundry Chat App</h1>
      {isAuthenticated ? (
        <>
          <button onClick={logout}>Logout</button>
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
