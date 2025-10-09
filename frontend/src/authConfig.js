// src/authConfig.js

const isLocalhost = window.location.hostname === "localhost";

export const msalConfig = {
  auth: {
    clientId: "7f5409d9-622c-4701-bafe-53c09a018607", // Your app's client ID
    authority: "https://login.microsoftonline.com/cb6120fa-a878-459e-969b-e04700bccd48", // Your tenant ID or common
    redirectUri: isLocalhost
      ? "http://localhost:3000" // local dev redirect URI
      : "https://yellow-rock-0b8f9f20f.1.azurestaticapps.net" // production redirect URI
  },
  cache: {
    cacheLocation: "sessionStorage", // or "localStorage" if you prefer
    storeAuthStateInCookie: false // helps with IE/Edge issues, set true if needed
  }
};

export const loginRequest = {
  scopes: ["User.Read"] // scopes your app requires (adjust as needed)
};
