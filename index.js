const functions = require('firebase-functions');

// Simple proxy to the built Express app
exports.api = functions.https.onRequest(async (req, res) => {
  try {
    // Import the main server module
    const { createExpressApp } = await import('./dist/src/app.js');
    const app = await createExpressApp();
    app(req, res);
  } catch (error) {
    console.error('Function initialization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
