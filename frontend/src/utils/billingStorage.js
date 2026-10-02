// Bill counter management
// Phase 5: Try server-synced counter first, fall back to localStorage
export async function getNextBillNumberFromServer(apiClient) {
  try {
    const response = await apiClient.get('/billing/next-number');
    if (response.data && response.data.billNumber) {
      // Also update local counter to stay in sync
      const match = response.data.billNumber.match(/BILL-\d{4}-(\d+)/);
      if (match) {
        localStorage.setItem('glimmr_bill_counter', parseInt(match[1], 10));
      }
      return response.data.billNumber;
    }
  } catch {
    // Server unreachable, fall back to local
  }
  return getNextBillNumber();
}

export function getNextBillNumber() {
  let counter = localStorage.getItem('glimmr_bill_counter');
  counter = counter ? parseInt(counter, 10) : 0;
  counter += 1;
  localStorage.setItem('glimmr_bill_counter', counter);
  const year = new Date().getFullYear();
  return `BILL-${year}-${counter.toString().padStart(4, '0')}`;
}

// Bill CRUD
export function saveBillLocally(billData) {
  const bills = getSavedBills();
  const bill = { ...billData, synced: false };
  bills.push(bill);
  localStorage.setItem('glimmr_bills', JSON.stringify(bills));
  return bill;
}

export function getSavedBills() {
  try {
    const billsJson = localStorage.getItem('glimmr_bills');
    const bills = billsJson ? JSON.parse(billsJson) : [];
    return Array.isArray(bills) ? bills.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  } catch {
    return [];
  }
}

export function getBillByNumber(billNumber) {
  const bills = getSavedBills();
  return bills.find(b => b.id === billNumber || b.billNumber === billNumber);
}

export function deleteBill(billId) {
  let bills = getSavedBills();
  bills = bills.filter(b => b.id !== billId && b.billNumber !== billId);
  localStorage.setItem('glimmr_bills', JSON.stringify(bills));
}

export function markBillSynced(billId) {
  const bills = getSavedBills();
  const billIndex = bills.findIndex(b => b.id === billId || b.billNumber === billId);
  if (billIndex !== -1) {
    bills[billIndex].synced = true;
    localStorage.setItem('glimmr_bills', JSON.stringify(bills));
  }
}

// Sync
export async function syncBillsToServer(apiClient) {
  const bills = getSavedBills();
  const unsynced = bills.filter(b => !b.synced);
  
  if (unsynced.length === 0) return 0;
  
  try {
    const response = await apiClient.post('/api/billing/sync', { bills: unsynced });
    if (response.data && response.data.synced !== undefined) {
      unsynced.forEach(b => markBillSynced(b.id || b.billNumber));
      return response.data.synced;
    }
  } catch (error) {
    console.error('Failed to sync bills', error);
    throw error;
  }
}

// Rate caching
export function getCachedRates() {
  const ratesJson = localStorage.getItem('glimmr_cached_rates');
  return ratesJson ? JSON.parse(ratesJson) : null;
}

export function setCachedRates(rates) {
  const rateData = { ...rates, fetchedAt: new Date().toISOString() };
  localStorage.setItem('glimmr_cached_rates', JSON.stringify(rateData));
}

// ============================================================
// Phase 6: Partial Payment - Local recording for offline support
// ============================================================

export function recordPaymentLocally(billId, paymentEntry) {
  const allBills = JSON.parse(localStorage.getItem('glimmr_bills') || '[]');
  const idx = allBills.findIndex(b => b.id === billId || b.billNumber === billId);
  if (idx < 0) return null;

  const bill = allBills[idx];
  bill.paymentEntries = bill.paymentEntries || [];
  bill.paymentEntries.push({
    ...paymentEntry,
    date: new Date().toISOString()
  });

  bill.amountPaid = bill.paymentEntries.reduce((sum, p) => sum + (p.amount || 0), 0);
  bill.balanceRemaining = Math.max(0, (bill.totalPayable || 0) - bill.amountPaid);
  bill.paymentStatus = bill.balanceRemaining <= 0 ? 'settled' : 'partially_paid';
  bill.synced = false; // Mark for re-sync

  allBills[idx] = bill;
  localStorage.setItem('glimmr_bills', JSON.stringify(allBills));
  return bill;
}

export function getPendingBills() {
  return getSavedBills().filter(b =>
    b.paymentStatus === 'partially_paid' || b.paymentStatus === 'pending'
  );
}

export function updateBillLocally(billId, updates) {
  const allBills = JSON.parse(localStorage.getItem('glimmr_bills') || '[]');
  const idx = allBills.findIndex(b => b.id === billId || b.billNumber === billId);
  if (idx < 0) return null;

  allBills[idx] = { ...allBills[idx], ...updates, synced: false };
  localStorage.setItem('glimmr_bills', JSON.stringify(allBills));
  return allBills[idx];
}
