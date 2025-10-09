// frontend/src/services/app.js

const isLocalhost = window.location.hostname === "localhost";

// Automatically set the base URL depending on environment
const apiBaseUrl = isLocalhost
  ? "http://localhost:7071"
  : ""; // Azure Static Web App uses relative path for backend

/**
 * Sends a message to the backend agent.
 *
 * @param {string} message - The user message to send.
 * @param {string} accessToken - Optional bearer token (for auth).
 * @param {string[]} fileIds - Optional list of file IDs.
 * @param {string|null} threadId - Optional thread ID.
 * @returns {Promise<Object>} - Backend response.
 */
export async function postToBackend(message, accessToken, fileIds = [], threadId = null) {
  try {
    const bodyPayload = { message };

    if (fileIds.length > 0) {
      bodyPayload.fileIds = fileIds;
    }

    if (threadId) {
      bodyPayload.threadId = threadId;
    }

    const response = await fetch(`${apiBaseUrl}/api/runAgent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && {
          Authorization: `Bearer ${accessToken}`
        })
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("postToBackend error:", err);
    throw err;
  }
}
