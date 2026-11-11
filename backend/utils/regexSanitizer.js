/**
 * ReDoS Defense Utility: Escapes all special characters in a string
 * before compiling it into a regular expression.
 */
function escapeRegex(string) {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
