// frontend/src/services/api.js

export async function postToBackend(message, accessToken, fileIds = [], threadId = null) {
  try {
    const bodyPayload = {
      message,
    };

    // ✅ Only include fileIds if any were uploaded
    if (fileIds.length > 0) {
      bodyPayload.fileIds = fileIds;
    }

    // ✅ Include threadId if one exists
    if (threadId) {
      bodyPayload.threadId = threadId;
    }

    const response = await fetch("http://localhost:7071/api/runAgent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      let errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("postToBackend error:", err);
    throw err;
  }
}
