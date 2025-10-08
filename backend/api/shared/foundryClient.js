const { AIProjectClient } = require("@azure/ai-projects");
const { DefaultAzureCredential } = require("@azure/identity");

function getFoundryClient() {
  const endpoint = process.env.AZURE_AI_PROJECT_ENDPOINT;
  if (!endpoint) throw new Error("Missing AZURE_AI_PROJECT_ENDPOINT in config");
  const credential = new DefaultAzureCredential();
  return new AIProjectClient(endpoint, credential);
}

module.exports = { getFoundryClient };
