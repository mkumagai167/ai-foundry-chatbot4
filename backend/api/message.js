const { app } = require('@azure/functions');

app.http('message', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    return {
      headers: {
        "Content-Type": "application/json"
      },
      body: { text: "Hello, from the API!" }
    };
  }
});