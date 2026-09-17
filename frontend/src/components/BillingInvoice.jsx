import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, DownloadIcon, CheckCircleIcon } from './Icons';

const BillingInvoice = ({ isOpen, onClose, billData }) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !billData) return null;

  const {
    billNumber = 'BILL-0000',
    date,
    customer = {},
    items = [],
    totalMetal = 0,
    totalMaking = 0,
    totalDiamond = 0,
    subtotal = 0,
    cgst = 0,
    sgst = 0,
    discountAmount = 0,
    couponCode = '',
    totalPayable = 0,
    paymentMethod = 'cash',
    cashReceived = 0,
    changeReturned = 0,
    goldRateUsed = 0,
    silverRateUsed = 0,
    operator = 'Owner',
    oldGoldDeduction = 0,
    oldGoldDetails = {},
    notes = '',
    paymentReference = ''
  } = billData;

  const invoiceDate = new Date(date || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const invoiceTime = new Date(date || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const loadImageAsBase64 = (src) => {
    return new Promise((resolve) => {
      if (!src) { resolve(null); return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 80;
          canvas.height = 80;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 80, 80);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);

    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    if (!window.jspdf) { setDownloading(false); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const imagePromises = items.map((d) => loadImageAsBase64(d.image));
    const imageDataArr = await Promise.all(imagePromises);

    doc.setFillColor(181, 154, 108);
    doc.rect(0, 0, 210, 4, 'F');

    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(17, 17, 17);
    doc.text('GLIMMR ATELIER', 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('HAUTE JOAILLERIE & CERTIFIED FINE JEWELRY', 15, 25);
    doc.text('GSTIN: 27AAAAA0000A1Z5   |   HSN Code: 7113   |   BIS License: HM-916-84920', 15, 29);
    doc.text('Atelier Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051', 15, 33);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(181, 154, 108);
    doc.text('STORE BILLING INVOICE', 195, 18, { align: 'right' });

    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    doc.text(billNumber, 195, 24, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${invoiceDate}  |  ${invoiceTime}`, 195, 29, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 122, 59);
    doc.text(`Payment: ${paymentMethod.toUpperCase()}`, 195, 34, { align: 'right' });

    doc.setDrawColor(229, 226, 217);
    doc.setLineWidth(0.4);
    doc.line(15, 38, 195, 38);

    doc.setFillColor(250, 249, 247);
    doc.rect(15, 42, 180, 20, 'F');
    doc.setDrawColor(229, 226, 217);
    doc.rect(15, 42, 180, 20, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(181, 154, 108);
    doc.text('CUSTOMER DETAILS', 20, 48);

    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 17, 17);
    doc.text(customer.name || 'Walk-in Customer', 20, 53);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Phone: ${customer.phone || 'N/A'}`, 20, 58);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(181, 154, 108);
    doc.text('METAL RATES APPLIED', 120, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Gold: Rs. ${Number(goldRateUsed).toLocaleString('en-IN')}/g`, 120, 53);
    doc.text(`Silver: Rs. ${Number(silverRateUsed).toLocaleString('en-IN')}/g  |  Operator: ${operator}`, 120, 58);

    let y = 68;
    doc.setFillColor(17, 17, 17);
    doc.rect(15, y, 180, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('ITEM DESCRIPTION', 20, y + 5.5);
    doc.text('SPEC / PURITY', 105, y + 5.5);
    doc.text('QTY', 140, y + 5.5, { align: 'center' });
    doc.text('UNIT PRICE (Rs.)', 165, y + 5.5, { align: 'right' });
    doc.text('TOTAL (Rs.)', 190, y + 5.5, { align: 'right' });

    y += 8;

    items.forEach((d, index) => {
      const imgData = imageDataArr[index];

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(250, 249, 247);
        doc.rect(15, y, 180, d.weight > 0 ? 16 : 12, 'F');
      }

      let textX = 20;
      if (imgData) {
        try {
          doc.addImage(imgData, 'JPEG', 20, y + 1, 10, 10);
          textX = 33;
        } catch { /* skip image */ }
      }

      doc.setFont('times', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(17, 17, 17);
      doc.text(String(d.name || 'Jewelry Piece').substring(0, 35), textX, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(140, 140, 140);
      doc.text('HSN: 7113  |  BIS Hallmarked', textX, y + 10);

      if (d.weight > 0) {
        doc.setFontSize(6.5);
        doc.setTextColor(120, 120, 120);
        const breakdownParts = [`Metal: Rs.${(d.metalCost * d.quantity).toLocaleString('en-IN')}`, `Making: Rs.${(d.makingCharges * d.quantity).toLocaleString('en-IN')}`];
        if (d.gemstoneCost > 0) breakdownParts.push(`Diamond: Rs.${(d.gemstoneCost * d.quantity).toLocaleString('en-IN')}`);
        doc.text(breakdownParts.join('  |  '), textX, y + 13.5);
      }

      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const mat = (d.material || 'gold').charAt(0).toUpperCase() + (d.material || 'gold').slice(1);
      const spec = `${mat} ${d.karat ? d.karat + 'K' : ''} ${d.weight ? d.weight + 'g' : ''}`.trim();
      doc.text(spec, 105, y + 6);

      doc.text(String(d.quantity), 140, y + 6, { align: 'center' });
      doc.text(`Rs. ${Number(d.totalPrice).toLocaleString('en-IN')}`, 165, y + 6, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 17, 17);
      doc.text(`Rs. ${(d.totalPrice * d.quantity).toLocaleString('en-IN')}`, 190, y + 6, { align: 'right' });

      y += (d.weight > 0 ? 17 : 13);
      doc.setDrawColor(230, 230, 230);
      doc.line(15, y, 195, y);
    });

    y += 6;
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(17, 17, 17);
    doc.text('Declaration & Legal Terms:', 15, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('We declare that this invoice shows the actual price of', 15, y + 8);
    doc.text('the goods described and that all particulars are true.', 15, y + 12);
    doc.text('Gold and Silver jewelry is 100% BIS Hallmarked.', 15, y + 16);

    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text('Subtotal (Before Tax):', 140, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 17, 17);
    doc.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, 190, y + 4, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('CGST (1.5%):', 140, y + 9);
    doc.text(`Rs. ${cgst.toLocaleString('en-IN')}`, 190, y + 9, { align: 'right' });

    doc.text('SGST (1.5%):', 140, y + 14);
    doc.text(`Rs. ${sgst.toLocaleString('en-IN')}`, 190, y + 14, { align: 'right' });

    let currentYOffset = y + 14;
    if (discountAmount > 0) {
      currentYOffset += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 120, 50);
      doc.text(`Voucher (${couponCode || 'Privilege'}):`, 140, currentYOffset);
      doc.text(`-Rs. ${discountAmount.toLocaleString('en-IN')}`, 190, currentYOffset, { align: 'right' });
    }

    if (oldGoldDeduction > 0) {
      currentYOffset += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 100, 20);
      doc.text(`Old Gold Exchange:`, 140, currentYOffset);
      doc.text(`-Rs. ${oldGoldDeduction.toLocaleString('en-IN')}`, 190, currentYOffset, { align: 'right' });
    }

    doc.setDrawColor(17, 17, 17);
    doc.setLineWidth(0.4);
    doc.line(140, currentYOffset + 3, 195, currentYOffset + 3);

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    doc.text('Total Payable:', 140, currentYOffset + 9);
    doc.text(`Rs. ${totalPayable.toLocaleString('en-IN')}`, 190, currentYOffset + 9, { align: 'right' });

    if (paymentMethod === 'cash' && cashReceived > 0) {
      currentYOffset += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Cash Received:', 140, currentYOffset);
      doc.text(`Rs. ${cashReceived.toLocaleString('en-IN')}`, 190, currentYOffset, { align: 'right' });
      doc.text('Change Returned:', 140, currentYOffset + 5);
      doc.text(`Rs. ${changeReturned.toLocaleString('en-IN')}`, 190, currentYOffset + 5, { align: 'right' });
    }

    const footerY = Math.max(currentYOffset + 20, y + 38);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, footerY, 195, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Computer Generated Certified GST Invoice', 15, footerY + 6);

    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(181, 154, 108);
    doc.text('Glimmr Atelier', 195, footerY + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('AUTHORIZED SIGNATORY', 195, footerY + 9, { align: 'right' });

    doc.setFillColor(181, 154, 108);
    doc.rect(0, 293, 210, 4, 'F');

    doc.save(`Bill_${billNumber}.pdf`);
    setDownloading(false);
  };

  const handlePrint = () => {
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`<html><head><title>${billNumber} - Glimmr Atelier</title><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;600;700&family=Fragment+Mono&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans',sans-serif;color:#222;padding:20mm}.gold-bar{height:4px;background:#B59A6C;margin-bottom:20px}.header{display:flex;justify-content:space-between;margin-bottom:16px}.brand{font-family:'Playfair Display',serif;font-size:22px;font-weight:700}.sub{font-size:7.5px;color:#888;margin-top:4px}.bill-meta{text-align:right}.bill-meta .label{font-size:9px;color:#B59A6C;font-weight:700;text-transform:uppercase;letter-spacing:.1em}.bill-meta .number{font-size:14px;font-weight:700;margin-top:4px}.bill-meta .date{font-size:8.5px;color:#888;margin-top:2px}.customer-box{background:#FAF9F7;border:1px solid #E5E2D9;padding:12px 16px;margin:16px 0;display:flex;justify-content:space-between}.customer-box .section-label{font-size:8px;color:#B59A6C;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px}.customer-box .name{font-family:'Playfair Display',serif;font-size:12px;font-weight:700}.customer-box .detail{font-size:8px;color:#555;margin-top:2px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#111;color:#fff;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:6px 8px;text-align:left}th.right{text-align:right}th.center{text-align:center}td{padding:8px;font-size:9px;border-bottom:1px solid #eee;vertical-align:top}td.right{text-align:right;font-family:'Fragment Mono',monospace}td.center{text-align:center;font-family:'Fragment Mono',monospace;font-weight:700}td.bold{font-weight:700}.item-img{width:32px;height:32px;object-fit:cover;border:1px solid #eee;margin-right:8px;vertical-align:middle}.item-name{font-family:'Playfair Display',serif;font-weight:700;font-size:10px}.item-hsn{font-size:6.5px;color:#aaa;margin-top:2px}.item-breakdown{font-size:7px;color:#888;margin-top:3px}.summary{display:flex;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid #ddd}.declaration{max-width:240px;font-size:7.5px;color:#888}.declaration .title{font-size:8px;color:#111;font-weight:700;margin-bottom:4px}.totals{min-width:200px}.totals .row{display:flex;justify-content:space-between;margin-bottom:4px;font-size:9px;color:#555}.totals .row .val{font-family:'Fragment Mono',monospace;font-weight:700;color:#111}.totals .grand{border-top:2px solid #111;padding-top:8px;margin-top:6px}.totals .grand .label{font-family:'Playfair Display',serif;font-size:12px;font-weight:700}.totals .grand .val{font-family:'Fragment Mono',monospace;font-size:14px;font-weight:700}.discount-row{color:#147a3b;background:#f0fdf4;padding:4px 6px;border:1px solid #bbf7d0;margin-bottom:4px}.footer{margin-top:24px;padding-top:12px;border-top:1px solid #ddd;display:flex;justify-content:space-between;align-items:flex-end}.footer .cert{font-size:7.5px;color:#888}.footer .sig{text-align:right}.footer .sig .brand{font-family:'Playfair Display',serif;font-size:12px;color:#B59A6C;font-weight:700}.footer .sig .label{font-size:7px;color:#aaa;text-transform:uppercase;letter-spacing:.15em;margin-top:2px}@media print{body{padding:10mm}}</style></head><body><div class="gold-bar"></div><div class="header"><div><div class="brand">GLIMMR ATELIER</div><div class="sub">HAUTE JOAILLERIE & CERTIFIED FINE JEWELRY</div><div class="sub">GSTIN: 27AAAAA0000A1Z5 | HSN Code: 7113 | BIS License: HM-916-84920</div><div class="sub">Atelier Tower, Bandra Kurla Complex, Mumbai 400051</div></div><div class="bill-meta"><div class="label">Store Billing Invoice</div><div class="number">${billNumber}</div><div class="date">${invoiceDate} | ${invoiceTime}</div><div class="date" style="color:#147a3b;font-weight:700">Payment: ${paymentMethod.toUpperCase()}</div></div></div><div class="customer-box"><div><div class="section-label">Customer Details</div><div class="name">${customer.name || 'Walk-in Customer'}</div><div class="detail">Phone: ${customer.phone || 'N/A'}</div></div><div><div class="section-label">Metal Rates Applied</div><div class="detail">Gold: Rs. ${Number(goldRateUsed).toLocaleString('en-IN')}/g</div><div class="detail">Silver: Rs. ${Number(silverRateUsed).toLocaleString('en-IN')}/g | Operator: ${operator}</div></div></div><table><thead><tr><th>Item Description</th><th>Spec / Purity</th><th class="center">Qty</th><th class="right">Unit Price</th><th class="right">Total</th></tr></thead><tbody>${items.map(d => { const mat = (d.material || 'gold').charAt(0).toUpperCase() + (d.material || 'gold').slice(1); return `<tr><td>${d.image ? `<img src="${d.image}" class="item-img" />` : ''}<div class="item-name">${d.name || 'Jewelry Piece'}</div><div class="item-hsn">HSN: 7113 | BIS Hallmarked</div>${d.weight > 0 ? `<div class="item-breakdown">Metal: Rs.${(d.metalCost * d.quantity).toLocaleString('en-IN')} | Making: Rs.${(d.makingCharges * d.quantity).toLocaleString('en-IN')}${d.gemstoneCost > 0 ? ` | Diamond: Rs.${(d.gemstoneCost * d.quantity).toLocaleString('en-IN')}` : ''}</div>` : ''}</td><td>${mat} ${d.karat ? d.karat + 'K' : ''} ${d.weight ? d.weight + 'g' : ''}</td><td class="center">${d.quantity}</td><td class="right">Rs. ${Number(d.totalPrice).toLocaleString('en-IN')}</td><td class="right bold">Rs. ${(d.totalPrice * d.quantity).toLocaleString('en-IN')}</td></tr>`; }).join('')}</tbody></table><div class="summary"><div class="declaration"><div class="title">Declaration & Legal Terms:</div><div>We declare that this invoice shows the actual price of the goods described and all particulars are true and correct. All Gold and Silver jewelry is 100% BIS Hallmarked.</div></div><div class="totals"><div class="row"><span>Subtotal (Before Tax):</span><span class="val">Rs. ${subtotal.toLocaleString('en-IN')}</span></div><div class="row"><span>CGST (1.5%):</span><span class="val">Rs. ${cgst.toLocaleString('en-IN')}</span></div><div class="row"><span>SGST (1.5%):</span><span class="val">Rs. ${sgst.toLocaleString('en-IN')}</span></div>${discountAmount > 0 ? `<div class="row discount-row"><span>Voucher (${couponCode || 'Privilege'}):</span><span class="val">-Rs. ${discountAmount.toLocaleString('en-IN')}</span></div>` : ''}${oldGoldDeduction > 0 ? `<div class="row" style="color:#b45309;background:#fffbeb;padding:4px 6px;border:1px solid #fde68a;margin-bottom:4px;"><span>Old Gold Exchange:</span><span class="val">-Rs. ${oldGoldDeduction.toLocaleString('en-IN')}</span></div>` : ''}<div class="row grand"><span class="label">Total Payable:</span><span class="val">Rs. ${totalPayable.toLocaleString('en-IN')}</span></div>${paymentMethod === 'cash' && cashReceived > 0 ? `<div class="row" style="margin-top:6px"><span>Cash Received:</span><span class="val">Rs. ${cashReceived.toLocaleString('en-IN')}</span></div><div class="row"><span>Change Returned:</span><span class="val">Rs. ${changeReturned.toLocaleString('en-IN')}</span></div>` : ''}</div></div><div class="footer"><div class="cert">Computer Generated Certified GST Invoice</div><div class="sig"><div class="brand">Glimmr Atelier</div><div class="label">Authorized Signatory</div></div></div></body></html>`);
    frameDoc.close();
    setTimeout(() => { printFrame.contentWindow.print(); setTimeout(() => document.body.removeChild(printFrame), 1000); }, 500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-3xl bg-white border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.2)] my-auto max-h-[95vh] overflow-y-auto"
        >
          <div className="h-1 bg-[#B59A6C] w-full" />
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-heading text-2xl font-bold text-[#111111] tracking-wider">GLIMMR ATELIER</h2>
                <p className="text-[10px] font-body text-gray-400 uppercase tracking-[0.15em] mt-0.5">Haute Joaillerie & Certified Fine Jewelry</p>
                <p className="text-[9px] font-body text-gray-400 mt-1">GSTIN: 27AAAAA0000A1Z5 | HSN: 7113 | BIS: HM-916-84920</p>
                <p className="text-[9px] font-body text-gray-400">Atelier Tower, BKC, Mumbai 400051</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-body font-bold text-[#B59A6C] uppercase tracking-[0.15em] block">Store Billing Invoice</span>
                <span className="font-mono text-lg font-extrabold text-[#111111] block mt-0.5">{billNumber}</span>
                <span className="text-[10px] font-body text-gray-500 block mt-0.5">{invoiceDate} | {invoiceTime}</span>
                <span className="text-[10px] font-body font-bold text-emerald-700 uppercase block mt-0.5">Payment: {paymentMethod.toUpperCase()}</span>
              </div>
            </div>

            {/* Customer & Rates */}
            <div className="bg-[#FAF9F7] border border-gray-200 p-4 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <span className="text-[9px] font-body font-bold text-[#B59A6C] uppercase tracking-[0.15em] block mb-1">Customer Details</span>
                <p className="font-heading font-bold text-sm text-[#111111]">{customer.name || 'Walk-in Customer'}</p>
                <p className="text-[10px] font-body text-gray-500 mt-0.5">Phone: {customer.phone || 'N/A'}</p>
                {customer.address && <p className="text-[10px] font-body text-gray-500 mt-0.5">Address: {customer.address}</p>}
                {customer.gstin && <p className="text-[10px] font-mono text-[#B59A6C] font-bold mt-0.5">GSTIN: {customer.gstin}</p>}
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[9px] font-body font-bold text-[#B59A6C] uppercase tracking-[0.15em] block mb-1">Metal Rates Applied</span>
                <p className="text-[10px] font-mono font-bold text-[#111111]">Gold: Rs.{Number(goldRateUsed).toLocaleString('en-IN')}/g</p>
                <p className="text-[10px] font-mono font-bold text-[#111111]">Silver: Rs.{Number(silverRateUsed).toLocaleString('en-IN')}/g</p>
                <p className="text-[9px] font-body text-gray-400 mt-0.5">Operator: {operator}</p>
              </div>
            </div>

            {/* Item Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-body">
                <thead>
                  <tr className="bg-[#111111] text-white">
                    <th className="py-2.5 px-3 text-left font-bold uppercase tracking-wider text-[10px]">Item Description</th>
                    <th className="py-2.5 px-3 text-left font-bold uppercase tracking-wider text-[10px]">Spec / Purity</th>
                    <th className="py-2.5 px-3 text-center font-bold uppercase tracking-wider text-[10px]">Qty</th>
                    <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider text-[10px]">Unit Price</th>
                    <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider text-[10px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((d, idx) => {
                    const mat = (d.material || 'gold').charAt(0).toUpperCase() + (d.material || 'gold').slice(1);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 border-b border-gray-100">
                        <td className="py-3 px-3">
                          <div className="flex items-start gap-2.5">
                            {d.image && (
                              <img src={d.image} alt={d.name || 'Product'} className="w-10 h-10 object-cover border border-gray-200 shrink-0 bg-[#FAF9F7]" />
                            )}
                            <div className="min-w-0">
                              <p className="font-heading font-bold text-[#111111] leading-snug break-words">{d.name || 'Fine Jewelry Piece'}</p>
                              <span className="text-[9px] font-body text-gray-400 uppercase tracking-wider block mt-0.5">HSN: 7113 | BIS Hallmarked</span>
                              {d.weight > 0 && (
                                <div className="mt-1 text-[9px] text-gray-500">
                                  <span className="block">Metal: Rs.{(d.metalCost * d.quantity).toLocaleString('en-IN')} | Making: Rs.{(d.makingCharges * d.quantity).toLocaleString('en-IN')}{d.gemstoneCost > 0 ? ` | Diamond: Rs.${(d.gemstoneCost * d.quantity).toLocaleString('en-IN')}` : ''}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600">{mat} {d.karat ? `${d.karat}K` : ''} {d.weight ? `${d.weight}g` : ''}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold">{d.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">Rs.{Number(d.totalPrice).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">Rs.{(d.totalPrice * d.quantity).toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2 border-t border-gray-200">
              <div className="text-[10px] font-body text-gray-500 space-y-1 max-w-xs">
                <p className="font-bold text-[#111111] uppercase tracking-wider">Declaration & Terms:</p>
                <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Gold and Silver jewelry is 100% BIS Hallmarked.</p>
              </div>
              <div className="w-full sm:w-64 space-y-1.5 text-xs font-body text-gray-600 shrink-0">
                <div className="flex justify-between items-center">
                  <span>Subtotal (Before Tax):</span>
                  <span className="font-mono font-bold text-[#111111] whitespace-nowrap">Rs.{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>CGST (1.5%):</span>
                  <span className="font-mono text-gray-700 whitespace-nowrap">Rs.{cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SGST (1.5%):</span>
                  <span className="font-mono text-gray-700 whitespace-nowrap">Rs.{sgst.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-200">
                    <span className="font-bold uppercase text-[10px]">Voucher ({couponCode || 'Privilege'}):</span>
                    <span className="font-mono font-bold whitespace-nowrap">-Rs.{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {oldGoldDeduction > 0 && (
                  <div className="flex justify-between items-center text-amber-800 bg-amber-50 px-2 py-1 border border-amber-200">
                    <span className="font-bold uppercase text-[10px]">Old Gold Exchange:</span>
                    <span className="font-mono font-bold whitespace-nowrap">-Rs.{oldGoldDeduction.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-gray-200 pt-2 text-sm">
                  <span className="font-heading font-extrabold text-[#111111]">Total Payable:</span>
                  <span className="font-mono font-extrabold text-[#111111] whitespace-nowrap">Rs.{totalPayable.toLocaleString('en-IN')}</span>
                </div>
                {paymentMethod === 'cash' && cashReceived > 0 && (
                  <>
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span>Cash Received:</span>
                      <span className="font-mono font-bold text-[#111111]">Rs.{cashReceived.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Change Returned:</span>
                      <span className="font-mono font-bold text-emerald-700">Rs.{changeReturned.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer Signatory */}
            <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
              <div className="flex items-center gap-2 text-[10px] font-body text-gray-500">
                <CheckCircleIcon size={14} className="text-emerald-600" />
                <span>Computer Generated Certified GST Invoice</span>
              </div>
              <div className="text-right">
                <div className="w-28 h-8 border-b border-gray-300 mb-1 flex items-center justify-center">
                  <span className="font-heading text-xs italic text-[#B59A6C] tracking-widest font-bold">Glimmr Atelier</span>
                </div>
                <span className="text-[9px] font-body text-gray-400 uppercase tracking-widest block">AUTHORIZED SIGNATORY</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#222222] text-white py-3 text-xs font-body font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors cursor-pointer disabled:opacity-50"
              >
                <DownloadIcon size={16} />
                {downloading ? 'Generating PDF...' : 'Download PDF Invoice'}
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 border border-[#222222] text-[#222222] py-3 text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
              >
                <ShieldCheckIcon size={16} />
                Print Invoice
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-500 text-xs font-body font-bold uppercase tracking-wider hover:text-[#111111] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BillingInvoice;
