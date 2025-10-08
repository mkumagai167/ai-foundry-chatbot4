// backend/api/uploadToVectorStore/index.js
const { DefaultAzureCredential } = require("@azure/identity");
const { AgentsClient } = require("@azure/ai-agents");

module.exports = async function (context, req) {
  try {
    if (req.method !== "POST") {
      context.res = {
        status: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method not allowed" }),
      };
      return;
    }

    const { fileName, base64Data } = req.body || {};

    if (!fileName || !base64Data) {
      context.res = {
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing fileName or base64Data" }),
      };
      return;
    }

    const fileBuffer = Buffer.from(base64Data, "base64");
    const endpoint = process.env.AZURE_AI_PROJECT_ENDPOINT;
    const credential = new DefaultAzureCredential();
    const client = new AgentsClient(endpoint, credential);

    const uploaded = await client.files.upload(
      fileBuffer,
      "assistants", // Purpose
      { fileName }
    );

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: uploaded.id }),
    };
  } catch (err) {
    context.log("Upload error:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
