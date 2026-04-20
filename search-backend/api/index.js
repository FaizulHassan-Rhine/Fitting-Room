/**
 * Vercel serverless entry point.
 *
 * Vercel imports this file and exports `app` as the request handler.
 * For local development the server is started via app.listen().
 *
 * dotenv load order (mirrors Next.js convention):
 *   .env → base defaults
 *   .env.local → local overrides (gitignored, contains real credentials)
 */

require('dotenv').config();                              // load .env first
require('dotenv').config({ path: '.env.local', override: true }); // then override with .env.local
const app = require('../src/app');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  const basePort = Number(PORT);
  const maxAttempts = 5;

  const startDevServer = (port, attempt = 0) => {
    const server = app.listen(port, () => {
      const prefix = process.env.API_PREFIX || '/api/v1';
      console.log(`\n🚀  Server running at http://localhost:${port}`);
      console.log(`📦  API base:       http://localhost:${port}${prefix}`);
      console.log(`🔍  Search:         http://localhost:${port}${prefix}/search?q=shoes`);
      console.log(`💡  Autocomplete:   http://localhost:${port}${prefix}/search/autocomplete?q=sn`);
      console.log(`🔥  Trending:       http://localhost:${port}${prefix}/search/trending`);
      console.log(`📦  Products:       http://localhost:${port}${prefix}/products`);
      console.log(`💚  Health:         http://localhost:${port}/health\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
        const nextPort = port + 1;
        console.warn(`[Server] Port ${port} is busy. Retrying on ${nextPort}...`);
        startDevServer(nextPort, attempt + 1);
        return;
      }
      throw err;
    });
  };

  startDevServer(basePort);
}

// Vercel uses this export as the serverless function handler
module.exports = app;
