const isLocalhost = window.location.hostname === "localhost";

export const msalConfig = {
  auth: {
    clientId: "7f5409d9-622c-4701-bafe-53c09a018607",
    authority: "https://login.microsoftonline.com/cb6120fa-a878-459e-969b-e04700bccd48",
    redirectUri: isLocalhost
      ? "http://localhost:3000"
      : "https://yellow-rock-0b8f9f20f.1.azurestaticapps.net"
  },
  cache: {
    cacheLocation: "sessionStorage"
  }
};
