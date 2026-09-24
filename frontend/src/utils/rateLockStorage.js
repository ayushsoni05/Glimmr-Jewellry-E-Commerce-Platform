// Rate Lock Token Management
// Allows locking current gold/silver rate for a customer (valid for configurable period)

const STORAGE_KEY = 'glimmr_rate_locks';
const DEFAULT_VALIDITY_HOURS = 48; // 48-hour rate lock window

export function createRateLock(customerName, customerPhone, goldRate, silverRate, validityHours = DEFAULT_VALIDITY_HOURS) {
  const locks = getRateLocks();
  const token = `RL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  const lock = {
    token,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || '',
    goldRate: Number(goldRate),
    silverRate: Number(silverRate),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + validityHours * 60 * 60 * 1000).toISOString(),
    status: 'active', // 'active' | 'redeemed' | 'expired'
    redeemedBillNumber: null
  };
  
  locks.push(lock);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locks));
  return lock;
}

export function getRateLocks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const locks = data ? JSON.parse(data) : [];
    // Auto-expire old locks
    const now = new Date();
    return locks.map(lock => {
      if (lock.status === 'active' && new Date(lock.expiresAt) < now) {
        return { ...lock, status: 'expired' };
      }
      return lock;
    });
  } catch {
    return [];
  }
}

export function getActiveLocks() {
  return getRateLocks().filter(l => l.status === 'active');
}

export function redeemRateLock(token, billNumber) {
  const locks = getRateLocks();
  const idx = locks.findIndex(l => l.token === token);
  if (idx === -1) return { success: false, message: 'Token not found' };
  
  const lock = locks[idx];
  if (lock.status === 'expired' || new Date(lock.expiresAt) < new Date()) {
    locks[idx] = { ...lock, status: 'expired' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locks));
    return { success: false, message: 'Rate lock has expired' };
  }
  if (lock.status === 'redeemed') {
    return { success: false, message: `Already redeemed on bill ${lock.redeemedBillNumber}` };
  }
  
  locks[idx] = { ...lock, status: 'redeemed', redeemedBillNumber: billNumber };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locks));
  return { success: true, lock: locks[idx] };
}

export function deleteRateLock(token) {
  const locks = getRateLocks().filter(l => l.token !== token);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locks));
}

export function formatLockExpiry(expiresAt) {
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp - now;
  if (diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`;
}
