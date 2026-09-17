// Bill counter management
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
