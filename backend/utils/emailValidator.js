const disposableEmailDomains = new Set([
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'yopmail.com',
  'trashmail.com',
  'maildrop.cc',
  'sharklasers.com',
  'spam4.me',
  'tempemailaddress.com',
  'throwawaymail.com',
  'fakeinbox.com',
  'mailnesia.com',
  'tempail.com',
  'mytrashmail.com',
  'mintemail.com',
  'fake-mail.com',
  'telemail.cc',
  'temp-mail.io',
  'tempmail.org',
  'mailtest.in',
  'inboxalias.com',
  '10minuteemail.com',
  'gettempemail.com',
  'temp-mail.to',
  'trash-mail.com',
  'tempmail.dog',
  'mailtrap.io'
]);

// RFC 5322 simplified email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format (RFC-compliant)
 */
function isValidEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  
  const normalized = email.trim().toLowerCase();
  
  // Basic format check
  if (!emailRegex.test(normalized)) return false;
  
  // Length checks (RFC 5321)
  if (normalized.length > 254) return false;
  
  const [localPart, domain] = normalized.split('@');
  
  // Local part checks
  if (localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;
  
  // Domain checks
  if (domain.length < 3) return false;
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  
  return true;
}

/**
 * Check if domain is in disposable/temporary email list
 */
function isDisposableEmail(email) {
  if (!email) return false;
  
  const domain = email.trim().toLowerCase().split('@')[1];
  return disposableEmailDomains.has(domain);
}

/**
 * Comprehensive email validation
 * Returns: { isValid: boolean, error?: string }
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const normalized = email.trim().toLowerCase();

  // Format validation
  if (!isValidEmailFormat(normalized)) {
    return { isValid: false, error: 'Invalid email format. Please enter a valid email address.' };
  }

  // Disposable email check
  if (isDisposableEmail(normalized)) {
    return { 
      isValid: false, 
      error: 'Temporary/disposable email addresses are not allowed. Please use a permanent email address.' 
    };
  }

  // Additional safety checks
  const domain = normalized.split('@')[1];
  
  // Block common typos
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'gmai.com': 'gmail.com',
  };

  if (commonTypos[domain]) {
    return { 
      isValid: false, 
      error: `Did you mean ${commonTypos[domain]}? Please check your email domain.` 
    };
  }

  return { isValid: true };
}

module.exports = {
  validateEmail,
  isValidEmailFormat,
  isDisposableEmail
};
