// backend/api/runAgent/index.js
const axios = require("axios");
const qs = require("qs");

module.exports = async function (context, req) {
  try {
    context.log("runAgent triggered:", req.method);

    if (req.method === "OPTIONS") {
      context.res = {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      };const axios = require("axios");
const qs = require("qs");

module.exports = async function (context, req) {
  try {
    context.log("runAgent triggered:", req.method);

    // Handle preflight CORS
    if (req.method === "OPTIONS") {
      context.res = {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*", // use "*" or set specific origin
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      };
      return;
    }

    // ✅ Extract authenticated user info from SWA
    let user = null;
    const encodedPrincipal = req.headers["x-ms-client-principal"];
    if (encodedPrincipal) {
      const decoded = Buffer.from(encodedPrincipal, "base64").toString("utf8");
      user = JSON.parse(decoded);
      context.log("Authenticated user:", user.userDetails);
    } else {
      context.log("No authentication header — likely running locally");
    }

    const { message, threadId: existingThreadId, fileIds = [] } = req.body;

    if (!message) {
      context.res = {
        status: 400,
        body: { error: "Missing 'message' in request body." },
      };
      return;
    }

    const {
      AZURE_AI_PROJECT_ENDPOINT,
      FOUNDRY_AGENT_ID,
      AAD_CLIENT_ID,
      AAD_CLIENT_SECRET,
      AAD_TENANT_ID,
    } = process.env;

    // 1. Get Azure AD token
    const tokenResp = await axios.post(
      `https://login.microsoftonline.com/${AAD_TENANT_ID}/oauth2/v2.0/token`,
      qs.stringify({
        grant_type: "client_credentials",
        client_id: AAD_CLIENT_ID,
        client_secret: AAD_CLIENT_SECRET,
        scope: "https://ai.azure.com/.default",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const accessToken = tokenResp.data.access_token;
    context.log("Access token acquired");

    let threadId = existingThreadId;

    // 2. Create thread if missing
    if (!threadId) {
      const threadResp = await axios.post(
        `${AZURE_AI_PROJECT_ENDPOINT}/threads?api-version=v1`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      threadId = threadResp.data.id;
      context.log("New thread created:", threadId);
    } else {
      context.log("Reusing thread:", threadId);
    }

    // 3. Prepare message payload
    const msgPayload = {
      role: "user",
      content: message,
    };

    if (fileIds.length > 0) {
      msgPayload.attachments = fileIds.map((fid) => ({
        file_id: fid,
        tools: [{ type: "file_search" }],
      }));
    }

    // 4. Post message to thread
    await axios.post(
      `${AZURE_AI_PROJECT_ENDPOINT}/threads/${threadId}/messages?api-version=v1`,
      msgPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    context.log("Posted message with attachments if any");

    // 5. Start a run
    const runResp = await axios.post(
      `${AZURE_AI_PROJECT_ENDPOINT}/threads/${threadId}/runs?api-version=v1`,
      {
        assistant_id: FOUNDRY_AGENT_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const runId = runResp.data.id;
    context.log("Run started:", runId);

    // 6. Poll run status
    const maxTries = 10;
    const delayMs = 3000;
    let status = "queued";
    for (let i = 0; i < maxTries; i++) {
      await new Promise((r) => setTimeout(r, delayMs));
      const statusResp = await axios.get(
        `${AZURE_AI_PROJECT_ENDPOINT}/threads/${threadId}/runs/${runId}?api-version=v1`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      status = statusResp.data.status;
      context.log("Run status:", status);
      if (["completed", "failed", "cancelled"].includes(status)) break;
    }

    if (status !== "completed") {
      throw new Error(`Run did not complete successfully (status: ${status})`);
    }

    // 7. Retrieve assistant messages
    const msgResp = await axios.get(
      `${AZURE_AI_PROJECT_ENDPOINT}/threads/${threadId}/messages?api-version=v1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const assistantMessages = msgResp.data.data
      .filter((m) => m.role === "assistant")
      .map((m) => ({
        content: m.content,
        createdAt: m.created_at,
      }));

    // ✅ Return response
    context.res = {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // allow all or set specific
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: {
        threadId,
        assistantMessages,
        user: user || null, // Optional: return user info for frontend
      },
    };
  } catch (err) {
    context.log.error("Error in runAgent:", err.message);
    if (err.response) {
      context.log("Response data:", err.response.data);
      context.log("Status:", err.response.status);
    }
    context.res = {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: { error: err.message },
    };
  }
};

      return;
    }

    const { message, threadId: existingThreadId, fileIds = [] } = req.body;

    if (!message) {
      context.res = {
        status: 400,
        body: { error: "Missing 'message' in request body." },
      };
      return;
    }

    const {
      AZURE_AI_PROJECT_ENDPOINT,
      FOUNDRY_AGENT_ID,
      AAD_CLIENT_ID,
      AAD_CLIENT_SECRET,
      AAD_TENANT_ID,
    } = process.env;

    // 1. Get token
    const tokenResp = await axios.post(
      `https://login.microsoftonline.com/${AAD_TENANT_ID}/oauth2/v2.0/token`,
      qs.stringify({
        grant_type: "client_credentials",
        client_id: AAD_CLIENT_ID,
        client_secret: AAD_CLIENT_SECRET,
        scope: "https://ai.azure.com/.default",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const accessToken = tokenResp.data.access_token;
    context.log("Access token acquired");

    let threadId = existingThreadId;

    // 2. If no thread, create one (without message)
    if (!threadId) {
      const threadResp = await axios.post(
        `${AZURE_AI_PROJECT_ENDPOINT}/threads?api-version=v1`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      threadId = threadResp.data.id;
      context.log("New thread created:", threadId);
    } else {
      context.log("Reusing thread:", threadId);
    }

    // 3. Build message payload, including attachments
    const msgPayload = {
      role: "user",
      content: message,
    };

    if (fileIds.length > 0) {
      msgPayload.attachments = fileIds.map((fid) => ({
        file_id: fid,
        tools: [{ 
          type: "file_search"
        }],  
      }));
    }

    // 4. Post message to thread
    await axios.post(
      `${AZURE_AI_PROJECT_ENDPOINT}/threads/${threadId}/messages?api-version=v1`,
      msgPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    context.log("Posted message with attachments if any");

    // 5. Create a run
    const runResp = await axios.post(
      `${AZURE_AI_PROJECT_ENDPOINT}/threads/${threadId}/runs?api-version=v1`,
      {
        assistant_id: FOUNDRY_AGENT_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const runId = runResp.data.id;
    context.log("Run started:", runId);

    // 6. Poll run status
    const maxTries = 10;
    const delayMs = 3000;
    let status = "queued";
    for (let i = 0; i < maxTries; i++) {
      await new Promise((r) => setTimeout(r, delayMs));
      const statusResp = await axios.get(
        `${AZURE_AI_PROJECT_ENDPOINT}/threads/${threadId}/runs/${runId}?api-version=v1`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      status = statusResp.data.status;
      context.log("Run status:", status);
      if (["completed", "failed", "cancelled"].includes(status)) break;
    }

    if (status !== "completed") {
      throw new Error(`Run did not complete successfully (status: ${status})`);
    }

    // 7. Get messages
    const msgResp = await axios.get(
      `${AZURE_AI_PROJECT_ENDPOINT}/threads/${threadId}/messages?api-version=v1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const assistantMessages = msgResp.data.data
      .filter((m) => m.role === "assistant")
      .map((m) => ({
        content: m.content,
        createdAt: m.created_at,
      }));

    context.res = {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: {
        threadId,
        assistantMessages,
      },
    };
  } catch (err) {
    context.log.error("Error in runAgent:", err.message);
    if (err.response) {
      context.log("Response data:", err.response.data);
      context.log("Status:", err.response.status);
    }
    context.res = {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: { error: err.message },
    };
  }
};
