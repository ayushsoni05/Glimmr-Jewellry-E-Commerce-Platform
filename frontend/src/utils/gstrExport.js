// GSTR-1 B2C (Small) Invoice Export
// Generates CSV data from saved POS bills for GST filing

export function generateGSTR1CSV(bills) {
  if (!bills || bills.length === 0) return '';

  // GSTR-1 B2C Small format headers
  const headers = [
    'GSTIN/UIN of Recipient',
    'Receiver Name',
    'Invoice Number',
    'Invoice Date',
    'Invoice Value',
    'Place of Supply',
    'Reverse Charge',
    'Applicable % of Tax Rate',
    'Invoice Type',
    'E-Commerce GSTIN',
    'Rate',
    'Taxable Value',
    'Cess Amount'
  ];

  const rows = bills.map(bill => {
    const invoiceDate = new Date(bill.date);
    const formattedDate = `${String(invoiceDate.getDate()).padStart(2, '0')}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${invoiceDate.getFullYear()}`;
    
    return [
      bill.customer?.gstin || '',           // GSTIN (empty for B2C)
      bill.customer?.name || 'Walk-in Customer',
      bill.billNumber || bill.id,
      formattedDate,
      bill.totalPayable || 0,
      '27-Maharashtra',                      // Default place of supply
      'N',                                   // Reverse charge
      '',                                    // Applicable tax rate %
      bill.customer?.gstin ? 'B2B' : 'B2C Small',
      '',                                    // E-Commerce GSTIN
      bill.gstRate || 3,
      bill.subtotal || 0,
      0                                      // Cess
    ].map(val => `"${String(val).replace(/"/g, '""')}"`);
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadGSTR1(bills, monthLabel) {
  const csv = generateGSTR1CSV(bills);
  if (!csv) return;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `GSTR1_Glimmr_${monthLabel || 'export'}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function generateHSNSummary(bills) {
  if (!bills || bills.length === 0) return [];
  
  let totalQuantity = 0;
  let totalTaxableValue = 0;
  let totalGst = 0;
  let totalInvoiceValue = 0;
  
  bills.forEach(bill => {
    const itemCount = (bill.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
    totalQuantity += itemCount;
    totalTaxableValue += bill.subtotal || 0;
    totalGst += bill.totalGst || 0;
    totalInvoiceValue += bill.totalPayable || 0;
  });
  
  return [{
    hsnCode: '7113',
    description: 'Articles of jewellery and parts thereof',
    uqc: 'PCS',
    totalQuantity,
    totalTaxableValue: Math.round(totalTaxableValue),
    cgst: Math.round(totalGst / 2),
    sgst: Math.round(totalGst / 2),
    igst: 0,
    totalInvoiceValue: Math.round(totalInvoiceValue)
  }];
}
