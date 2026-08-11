/**
 * Email validation utility for frontend
 * Performs basic format validation (full validation happens on backend)
 */

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Frontend email validation (quick check before submission)
 * Returns: { isValid: boolean, error?: string, type?: string }
 * type can be: 'format', 'disposable', 'typo', 'valid'
 */
export function validateEmailFrontend(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required', type: 'format' };
  }

  const normalized = email.trim().toLowerCase();

  // Basic format check
  if (!emailRegex.test(normalized)) {
    return { 
      isValid: false, 
      error: 'Invalid email format. Please enter a valid email address.',
      type: 'format'
    };
  }

  // Check length
  if (normalized.length > 254) {
    return { 
      isValid: false, 
      error: 'Email address is too long.',
      type: 'format'
    };
  }

  const [localPart, domain] = normalized.split('@');

  // Local part validation
  if (localPart.length > 64) {
    return { isValid: false, error: 'Email address is too long.', type: 'format' };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { isValid: false, error: 'Invalid email format.', type: 'format' };
  }

  // Disposable email check
  if (disposableEmailDomains.has(domain)) {
    return {
      isValid: false,
      error: 'Temporary/disposable email addresses are not allowed. Please use a permanent email address.',
      type: 'disposable'
    };
  }

  // Common typo detection
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'gmai.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'outlok.com': 'outlook.com',
  };

  if (commonTypos[domain]) {
    return {
      isValid: false,
      error: `Did you mean ${localPart}@${commonTypos[domain]}? Please check your email domain.`,
      type: 'typo',
      suggestion: `${localPart}@${commonTypos[domain]}`
    };
  }

  return { isValid: true, type: 'valid' };
}

/**
 * Check if email domain is common (for UI hint)
 */
export function isCommonEmailDomain(email) {
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'mail.com'];
  const domain = email.toLowerCase().split('@')[1];
  return commonDomains.includes(domain);
}
