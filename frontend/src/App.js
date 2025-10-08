import React, { useState} from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import Chat from "./components/Chat";
import FileUpload from "./components/FileUpload";
import ExportButtons from "./components/ExportButtons";

function App() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [messages, setMessages] = useState([]);
  
  function login() {
    instance.loginPopup();
  }

  function logout() {
    instance.logoutPopup();
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
