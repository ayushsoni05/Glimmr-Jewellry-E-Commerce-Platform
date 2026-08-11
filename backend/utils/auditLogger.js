const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const auditLogFile = path.join(logDir, 'audit.log');

/**
 * Log administrative or critical security actions to audit.log
 * @param {Object} event
 */
function logAuditEvent(event) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
    const payload = Object.assign(
      {
        timestamp: new Date().toISOString(),
        severity: event.severity || 'INFO',
      },
      event
    );
    fs.appendFileSync(auditLogFile, JSON.stringify(payload) + '\n');
    console.log(`[AUDIT_LOG] [${payload.severity}] ${event.action} - User: ${event.userId || event.email || 'N/A'}`);
  } catch (err) {
    console.error('[AUDIT_LOG_ERROR] Failed to write audit log:', err.message);
  }
}

module.exports = { logAuditEvent };
