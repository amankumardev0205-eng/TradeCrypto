const tokenService = require('../services/tokenService');

/**
 * Periodically purge expired and revoked tokens from Firestore
 */
async function runTokenCleanup() {
  try {
    console.log('[Token Cleanup] Starting purge of expired and revoked refresh tokens...');
    const purgedCount = await tokenService.purgeExpiredTokens();
    console.log(`[Token Cleanup] Successfully purged ${purgedCount} token documents from Firestore.`);
  } catch (err) {
    console.error('[Token Cleanup Error]:', err);
  }
}

if (require.main === module) {
  runTokenCleanup();
}

module.exports = { runTokenCleanup };
