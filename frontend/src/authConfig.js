export const msalConfig = {
  auth: {
    clientId: "7f5409d9-622c-4701-bafe-53c09a018607",
    authority: "https://login.microsoftonline.com/cb6120fa-a878-459e-969b-e04700bccd48",
    redirectUri: "http://localhost:3000"
  },
  cache: { cacheLocation: "sessionStorage" }
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "api://<BACKEND_CLIENT_ID>/access_as_user"]
};
