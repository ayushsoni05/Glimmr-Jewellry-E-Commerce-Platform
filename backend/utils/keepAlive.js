/**
 * Keep-Alive Service for Render Free Tier
 * 
 * Render free tier spins down after 15 minutes of inactivity.
 * This service pings the backend every 14 minutes to keep it awake.
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com';
const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes
const ENABLE_KEEP_ALIVE = process.env.ENABLE_KEEP_ALIVE !== 'false'; // Enabled by default

let pingInterval = null;

function startKeepAlive() {
  if (!ENABLE_KEEP_ALIVE) {
    console.log('[KEEP_ALIVE] Disabled via environment variable');
    return;
  }

  console.log('[KEEP_ALIVE] Starting keep-alive service...');
  console.log('[KEEP_ALIVE] Will ping', BACKEND_URL, 'every 14 minutes');

  // Ping immediately on startup (after 30 seconds)
  setTimeout(() => {
    pingBackend();
  }, 30000);

  // Then ping every 14 minutes
  pingInterval = setInterval(() => {
    pingBackend();
  }, PING_INTERVAL_MS);
}

function stopKeepAlive() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log('[KEEP_ALIVE] Keep-alive service stopped');
  }
}

async function pingBackend() {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Glimmr-KeepAlive/1.0'
      }
    });
    const duration = Date.now() - startTime;
    
    console.log(`[KEEP_ALIVE] ✅ Ping successful (${duration}ms) - Backend is awake`);
    return response.data;
  } catch (error) {
    console.error('[KEEP_ALIVE] ❌ Ping failed:', error.message);
    return null;
  }
}

module.exports = {
  startKeepAlive,
  stopKeepAlive,
  pingBackend
};
