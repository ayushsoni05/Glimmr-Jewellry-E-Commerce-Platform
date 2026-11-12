import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, DownloadIcon, CheckCircleIcon } from './Icons';
import { numberToIndianWords } from '../utils/numberToIndianWords';
import { STORE_CONFIG } from '../config/storeConfig';

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
    paymentReference = '',
    gstRate = 3,
    taxSplitMode = 'split',
    totalGst = 0,
    igst = 0,
    paymentStatus = 'paid',
    amountPaid = 0,
    balanceRemaining = 0,
    dueDate,
    paymentEntries = [],
    billType = 'gst'
  } = billData;

  const safeItems = Array.isArray(items) ? items : [];
  const rateNum = Number(gstRate) || 0;
  const computedTotalGst = totalGst > 0 ? totalGst : (Number(cgst) + Number(sgst) + Number(igst)) || Math.round(subtotal * (rateNum / 100));
  const isSingle = taxSplitMode === 'single' || (cgst === 0 && sgst === 0 && computedTotalGst > 0);
  const cgstPercent = Number((rateNum / 2).toFixed(2));
  const sgstPercent = Number((rateNum / 2).toFixed(2));

  const invoiceDate = new Date(date || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const invoiceTime = new Date(date || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getMakingModeLabel = (item) => {
    const type = item.makingChargeType || (item.makingCharges ? 'percent' : 'percent');
    const val = item.makingChargeValue !== undefined && item.makingChargeValue !== null ? item.makingChargeValue : 12;
    if (type === 'percent') return `${val}%`;
    if (type === 'per_gram') return `Rs.${val}/g`;
    if (type === 'flat') return 'Flat';
    return `${val}%`;
  };

  const loadImageAsBase64 = (src) => {
    return new Promise((resolve) => {
      if (!src) { resolve(null); return; }
      if (src.startsWith('data:image/')) { resolve(src); return; }
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

    const imagePromises = safeItems.map((d) => loadImageAsBase64(d.image));
    const imageDataArr = await Promise.all(imagePromises);

    doc.setFillColor(181, 154, 108);
    doc.rect(0, 0, 210, 4, 'F');

    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(17, 17, 17);
    doc.text(STORE_CONFIG.name.toUpperCase(), 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(STORE_CONFIG.tagline.toUpperCase(), 15, 25);
    doc.text(`GSTIN: ${STORE_CONFIG.gstin}   |   HSN Code: ${STORE_CONFIG.hsn}   |   BIS License: ${STORE_CONFIG.bisLicense}`, 15, 29);
    doc.text(STORE_CONFIG.address.full, 15, 33);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(181, 154, 108);
    doc.text(rateNum > 0 ? 'TAX INVOICE' : 'BILL OF SUPPLY', 195, 18, { align: 'right' });

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
    doc.text(`Phone: ${customer.phone || 'N/A'}${customer.panNumber ? '  |  PAN: ' + customer.panNumber : ''}`, 20, 58);

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
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('#', 17, y + 5.5);
    doc.text('PHOTO', 23, y + 5.5);
    doc.text('ORNAMENT / HUID', 41, y + 5.5);
    doc.text('PURITY / SPEC', 106, y + 5.5);
    doc.text('NET WT', 137, y + 5.5, { align: 'right' });
    doc.text('QTY', 151, y + 5.5, { align: 'center' });
    doc.text('TOTAL (Rs.)', 190, y + 5.5, { align: 'right' });

    y += 8;

    safeItems.forEach((d, index) => {
      const imgData = imageDataArr[index];
      const rowHeight = 17;

      if (y + rowHeight > 250) {
        doc.addPage();
        y = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(250, 249, 247);
        doc.rect(15, y, 180, rowHeight, 'F');
      }

      // Index #
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(String(index + 1), 17, y + 7);

      // Verified Photo
      if (imgData) {
        try {
          doc.addImage(imgData, 'JPEG', 21, y + 1.5, 14, 14);
          doc.setDrawColor(181, 154, 108);
          doc.setLineWidth(0.2);
          doc.rect(21, y + 1.5, 14, 14, 'S');
        } catch { /* skip */ }
      } else {
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.2);
        doc.rect(21, y + 1.5, 14, 14, 'S');
        doc.setFontSize(5);
        doc.setTextColor(160, 160, 160);
        doc.text('PHOTO', 28, y + 9, { align: 'center' });
      }

      // Item Name
      doc.setFont('times', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(17, 17, 17);
      doc.text(String(d.name || 'Jewelry Piece').substring(0, 32), 41, y + 5.5);

      // HUID & Hallmark
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      const huidStr = d.huid ? `  |  HUID: ${d.huid}` : '';
      doc.text(`HSN: 7113  |  BIS Hallmarked${huidStr}`, 41, y + 9.5);

      // Weight breakdown & rate
      if (d.weight > 0 || d.netWeight > 0) {
        doc.setFontSize(5.8);
        doc.setTextColor(100, 100, 100);
        const rPg = d.ratePerGram ? `Rs.${d.ratePerGram.toLocaleString('en-IN')}/g` : '';
        const pur = d.purityPercent ? `${d.purityPercent.toFixed(1)}%` : '';
        const mkLabel = getMakingModeLabel(d);
        const nw = d.netWeight || d.weight || 0;
        doc.text(`Net: ${nw}g x ${rPg}  |  Making (${mkLabel}): Rs.${((d.makingCharges || 0) * d.quantity).toLocaleString('en-IN')}`, 41, y + 13.5);
      }

      // Purity / Spec
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(50, 50, 50);
      const mat = (d.material || 'gold').charAt(0).toUpperCase() + (d.material || 'gold').slice(1);
      doc.text(`${mat} ${d.karat ? d.karat + 'K' : ''}`, 106, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text(`${(d.purityPercent || 91.67).toFixed(1)}% Purity`, 106, y + 10);

      // Net Weight
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(17, 17, 17);
      doc.text(`${(d.netWeight || d.weight || 0).toFixed(3)}g`, 137, y + 7, { align: 'right' });

      // Qty
      doc.setFont('helvetica', 'normal');
      doc.text(String(d.quantity || 1), 151, y + 7, { align: 'center' });

      // Total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(17, 17, 17);
      doc.text(`Rs. ${((d.totalPrice || 0) * d.quantity).toLocaleString('en-IN')}`, 190, y + 7, { align: 'right' });

      y += rowHeight;
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(15, y, 195, y);
    });

    y += 6;
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(181, 154, 108);
    doc.text('ANTI-FRAUD & PHOTOGRAPHIC VERIFICATION:', 15, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 100, 100);
    doc.text('Articles photographically verified at counter. 100% BIS Hallmarked.', 15, y + 8);
    doc.text('Buyback/exchange strictly requires physical match with printed photo,', 15, y + 12);
    doc.text('verified net weight, and unique BIS HUID laser code.', 15, y + 16);

    const wordsStr = numberToIndianWords(totalPayable);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(17, 17, 17);
    doc.text('Amount in Words:', 15, y + 21);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    const splitWords = doc.splitTextToSize(wordsStr, 115);
    doc.text(splitWords, 15, y + 25);

    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text('Subtotal (Before Tax):', 135, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 17, 17);
    doc.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, 190, y + 4, { align: 'right' });

    let currentYOffset = y + 4;
    if (computedTotalGst > 0) {
      currentYOffset += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(17, 17, 17);
      doc.text(`Total GST (${rateNum}%):`, 135, currentYOffset);
      doc.text(`Rs. ${computedTotalGst.toLocaleString('en-IN')}`, 190, currentYOffset, { align: 'right' });

      if (!isSingle && (cgst > 0 || sgst > 0)) {
        currentYOffset += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(120, 120, 120);
        doc.text(`CGST (${cgstPercent}%): Rs.${cgst.toLocaleString('en-IN')}  |  SGST (${sgstPercent}%): Rs.${sgst.toLocaleString('en-IN')}`, 135, currentYOffset);
      }
    } else {
      currentYOffset += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`GST (0% Exempt):`, 135, currentYOffset);
      doc.text(`Rs. 0`, 190, currentYOffset, { align: 'right' });
    }
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

    // Phase 6: Partial Payment Status in PDF
    if (paymentStatus && paymentStatus !== 'paid') {
      currentYOffset += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(paymentStatus === 'settled' ? 20 : 180, paymentStatus === 'settled' ? 120 : 100, paymentStatus === 'settled' ? 50 : 20);
      const statusLabel = paymentStatus === 'settled' ? 'FULLY SETTLED' : paymentStatus === 'pending' ? 'PAYMENT PENDING' : 'PARTIALLY PAID';
      doc.text(statusLabel, 140, currentYOffset);
      if (paymentStatus !== 'settled') {
        currentYOffset += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(`Amount Paid: Rs.${amountPaid.toLocaleString('en-IN')}`, 140, currentYOffset);
        currentYOffset += 4;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 50, 50);
        doc.text(`Balance Due: Rs.${balanceRemaining.toLocaleString('en-IN')}`, 140, currentYOffset);
        if (dueDate) {
          currentYOffset += 4;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(120, 120, 120);
          doc.text(`Due By: ${new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 140, currentYOffset);
        }
      }
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
    doc.text(STORE_CONFIG.name, 195, footerY + 5, { align: 'right' });
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
    frameDoc.write(`<!DOCTYPE html>
<html>
<head>
  <title>${billNumber} - ${STORE_CONFIG.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;700&family=Fragment+Mono:wght@400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; color: #111; padding: 14mm 16mm; font-size: 9px; line-height: 1.35; }
    .gold-bar { height: 4px; background: #B59A6C; margin-bottom: 14px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .brand { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #07162C; letter-spacing: 0.05em; }
    .sub { font-size: 7.5px; color: #555; margin-top: 2px; }
    .bill-meta { text-align: right; }
    .bill-meta .badge { font-size: 8.5px; color: #B59A6C; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
    .bill-meta .number { font-size: 14px; font-weight: 700; font-family: 'Fragment Mono', monospace; color: #07162C; margin-top: 2px; }
    .bill-meta .date { font-size: 8px; color: #666; margin-top: 2px; }
    .bill-meta .payment-badge { font-size: 8px; color: #147a3b; font-weight: 700; margin-top: 2px; text-transform: uppercase; }

    .customer-box { background: #FAF9F7; border: 1px solid #E5E2D9; padding: 10px 14px; margin: 10px 0; display: flex; justify-content: space-between; gap: 16px; border-radius: 2px; }
    .customer-box .sec-title { font-size: 7.5px; color: #B59A6C; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 3px; }
    .customer-box .name { font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: #111; }
    .customer-box .detail { font-size: 8px; color: #555; margin-top: 1.5px; }

    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #07162C; color: #fff; font-size: 7.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 6px 6px; text-align: left; }
    th.center { text-align: center; }
    th.right { text-align: right; }
    td { padding: 6px; font-size: 8.5px; border-bottom: 1px solid #E8E5DD; vertical-align: middle; }
    td.center { text-align: center; }
    td.right { text-align: right; font-family: 'Fragment Mono', monospace; }
    td.bold { font-weight: 700; }

    .photo-cell { width: 52px; height: 52px; object-fit: cover; border: 1px solid #B59A6C; border-radius: 2px; display: block; margin: 0 auto; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .no-photo-box { width: 52px; height: 52px; border: 1px dashed #ccc; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 7.5px; color: #999; text-transform: uppercase; margin: 0 auto; background: #FAF9F7; }

    .item-name { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 9.5px; color: #07162C; }
    .item-hsn { font-size: 7px; color: #666; margin-top: 1.5px; }
    .huid-code { display: inline-block; padding: 0.5px 3.5px; background: #FFF8E7; border: 0.5px solid #B59A6C; border-radius: 2px; font-family: 'Fragment Mono', monospace; font-size: 7.5px; font-weight: 700; color: #8C6D37; }
    .item-breakdown { font-size: 7px; color: #666; margin-top: 2px; }

    .summary-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 12px; gap: 20px; }
    .declaration-box { flex: 1; max-width: 320px; }
    .totals-box { min-width: 230px; font-size: 8.5px; }
    .totals-box .row { display: flex; justify-content: space-between; margin-bottom: 3px; color: #555; }
    .totals-box .row .val { font-family: 'Fragment Mono', monospace; font-weight: 700; color: #111; }
    .totals-box .grand { border-top: 1.5px solid #07162C; padding-top: 6px; margin-top: 5px; }
    .totals-box .grand .label { font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: #07162C; }
    .totals-box .grand .val { font-family: 'Fragment Mono', monospace; font-size: 13px; font-weight: 700; color: #07162C; }

    .anti-fraud-banner { margin-top: 14px; padding: 8px 12px; background: #FCFAF6; border: 1px solid #B59A6C; border-left: 4px solid #B59A6C; border-radius: 2px; }
    .anti-fraud-title { font-size: 8px; font-weight: 700; color: #07162C; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
    .anti-fraud-text { font-size: 7px; line-height: 1.4; color: #444; }

    .signatures-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 8px; }
    .sig-block { width: 200px; text-align: center; }
    .sig-line { border-top: 1px solid #777; margin-top: 32px; margin-bottom: 3px; }
    .sig-title { font-size: 7.5px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.06em; }
    .sig-sub { font-size: 6.5px; color: #777; }

    @media print { body { padding: 8mm 10mm; } }
  </style>
</head>
<body>
  <div class="gold-bar"></div>
  <div class="header">
    <div>
      <div class="brand">${STORE_CONFIG.name.toUpperCase()}</div>
      <div class="sub">${STORE_CONFIG.tagline.toUpperCase()}</div>
      <div class="sub">GSTIN: ${STORE_CONFIG.gstin} | HSN Code: ${STORE_CONFIG.hsn} | BIS License: ${STORE_CONFIG.bisLicense}</div>
      <div class="sub">${STORE_CONFIG.address.full}</div>
    </div>
    <div class="bill-meta">
      <div class="badge">${rateNum > 0 ? 'Tax Invoice' : 'Bill of Supply'}</div>
      <div class="number">${billNumber}</div>
      <div class="date">${invoiceDate} | ${invoiceTime}</div>
      <div class="payment-badge">Payment: ${paymentMethod.toUpperCase()}</div>
    </div>
  </div>

  <div class="customer-box">
    <div>
      <div class="sec-title">Customer Details</div>
      <div class="name">${customer.name || 'Walk-in Customer'}</div>
      <div class="detail">Phone: ${customer.phone || 'N/A'}${customer.panNumber ? ' | PAN: ' + customer.panNumber : ''}</div>
      ${customer.address ? `<div class="detail">Address: ${customer.address}</div>` : ''}
      ${customer.gstin ? `<div class="detail">GSTIN: ${customer.gstin}</div>` : ''}
    </div>
    <div style="text-align: right;">
      <div class="sec-title">Counter Rates & Staff</div>
      <div class="detail">Gold 24K: <b>Rs. ${Number(goldRateUsed).toLocaleString('en-IN')}/g</b></div>
      <div class="detail">Silver: <b>Rs. ${Number(silverRateUsed).toLocaleString('en-IN')}/g</b></div>
      <div class="detail">Operator / Cashier: ${operator}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="center" style="width: 22px;">#</th>
        <th class="center" style="width: 58px;">Verified Photo</th>
        <th>Ornament Description & HUID</th>
        <th>Purity / Spec</th>
        <th class="right" style="width: 55px;">Gross Wt</th>
        <th class="right" style="width: 55px;">Net Wt</th>
        <th class="center" style="width: 28px;">Qty</th>
        <th class="right" style="width: 75px;">Rate & Making</th>
        <th class="right" style="width: 75px;">Item Total</th>
      </tr>
    </thead>
    <tbody>
      ${safeItems.map((d, idx) => {
        const mat = (d.material || 'gold').charAt(0).toUpperCase() + (d.material || 'gold').slice(1);
        const grossWt = Number(d.weight || d.netWeight || 0);
        const netWt = Number(d.netWeight || d.weight || 0);
        const pur = (d.purityPercent || (d.karat === 24 ? 99.9 : d.karat === 22 ? 91.67 : d.karat === 18 ? 75 : d.karat === 14 ? 58.33 : 92.5)).toFixed(1);
        return `<tr>
          <td class="center bold" style="color: #666;">${idx + 1}</td>
          <td class="center">
            ${d.image ? `<img src="${d.image}" class="photo-cell" alt="${d.name || ''}" />` : `<div class="no-photo-box">Photo</div>`}
          </td>
          <td>
            <div class="item-name">${d.name || 'Jewelry Piece'}</div>
            <div class="item-hsn">HSN: 7113 | BIS Hallmarked ${d.huid ? `| HUID: <span class="huid-code">${d.huid}</span>` : ''}</div>
            ${(d.weight > 0 || d.netWeight > 0) ? `<div class="item-breakdown">Metal Val: Rs.${((d.metalCost || 0) * (d.quantity || 1)).toLocaleString('en-IN')}${d.gemstoneCost > 0 ? ` | Stone: Rs.${((d.gemstoneCost || 0) * (d.quantity || 1)).toLocaleString('en-IN')}` : ''}</div>` : ''}
          </td>
          <td>
            <div style="font-weight: 700; color: #111;">${mat} ${d.karat ? d.karat + 'K' : ''}</div>
            <div style="font-size: 7px; color: #777;">${pur}% Purity</div>
          </td>
          <td class="right">${grossWt.toFixed(3)}g</td>
          <td class="right bold" style="color: #07162C;">${netWt.toFixed(3)}g</td>
          <td class="center bold">${d.quantity || 1}</td>
          <td class="right">
            <div>Rs. ${(d.ratePerGram || 0).toLocaleString('en-IN')}/g</div>
            <div style="font-size: 7px; color: #777;">Mk (${getMakingModeLabel(d)}): Rs.${((d.makingCharges || 0) * (d.quantity || 1)).toLocaleString('en-IN')}</div>
          </td>
          <td class="right bold" style="color: #07162C; font-size: 9.5px;">Rs. ${((d.totalPrice || 0) * (d.quantity || 1)).toLocaleString('en-IN')}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="declaration-box">
      <div style="font-size: 8px; font-weight: 700; color: #07162C; text-transform: uppercase; margin-bottom: 3px;">Declaration & Certification</div>
      <div style="font-size: 7px; color: #555; line-height: 1.4;">
        We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Gold and Silver jewellery is 100% BIS Hallmarked under IS 1417:2016. Verify authenticity on the BIS Care App using printed HUID.
      </div>
      <div style="margin-top: 6px; font-size: 7.5px; color: #111; font-style: italic;">
        <b>Amount in Words:</b> ${numberToIndianWords(totalPayable)}
      </div>
    </div>

    <div class="totals-box">
      <div class="row"><span>Taxable Subtotal:</span><span class="val">Rs. ${subtotal.toLocaleString('en-IN')}</span></div>
      ${computedTotalGst > 0 ? `
        <div class="row" style="font-weight: 700; color: #111;">
          <span>Total GST (${rateNum}%):</span>
          <span class="val">Rs. ${computedTotalGst.toLocaleString('en-IN')}</span>
        </div>
        ${!isSingle ? `
          <div class="row" style="font-size: 7px; color: #777; padding-left: 6px; margin-top: -2px;">
            <span>CGST (${cgstPercent}%): Rs. ${cgst.toLocaleString('en-IN')} &nbsp;|&nbsp; SGST (${sgstPercent}%): Rs. ${sgst.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
      ` : `
        <div class="row"><span>GST (0% Exempt):</span><span class="val">Rs. 0</span></div>
      `}
      ${discountAmount > 0 ? `
        <div class="row" style="color: #147a3b; background: #f0fdf4; padding: 2px 4px; border: 1px solid #bbf7d0;">
          <span>Voucher (${couponCode || 'Privilege'}):</span>
          <span class="val">-Rs. ${discountAmount.toLocaleString('en-IN')}</span>
        </div>
      ` : ''}
      ${oldGoldDeduction > 0 ? `
        <div class="row" style="color: #b45309; background: #fffbeb; padding: 2px 4px; border: 1px solid #fde68a;">
          <span>Old Gold Exchange:</span>
          <span class="val">-Rs. ${oldGoldDeduction.toLocaleString('en-IN')}</span>
        </div>
      ` : ''}
      <div class="row grand">
        <span class="label">Total Payable:</span>
        <span class="val">Rs. ${totalPayable.toLocaleString('en-IN')}</span>
      </div>
      ${paymentMethod === 'cash' && cashReceived > 0 ? `
        <div class="row" style="margin-top: 4px;"><span>Cash Received:</span><span class="val">Rs. ${cashReceived.toLocaleString('en-IN')}</span></div>
        <div class="row"><span>Change Returned:</span><span class="val">Rs. ${changeReturned.toLocaleString('en-IN')}</span></div>
      ` : ''}
    </div>
  </div>

  <div class="anti-fraud-banner">
    <div class="anti-fraud-title">Anti-Fraud & Photographic Article Verification Notice</div>
    <div class="anti-fraud-text">
      This certified GST Tax Invoice contains photographic verification of the exact article(s) delivered to the buyer at the billing counter. All pieces are hallmarked with BIS standards and unique 6-character HUID laser codes. To prevent substitution fraud or spurious claims, any buyback, repair, exchange, or return is strictly subject to matching the physical ornament with the printed photograph, verified net weight, and BIS HUID.
    </div>
  </div>

  <div class="signatures-row">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-title">Customer Acknowledgement</div>
      <div class="sig-sub">"I confirm receipt of genuine articles matching photos & net weight."</div>
    </div>
    <div class="sig-block">
      <div style="font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: #B59A6C;">${STORE_CONFIG.name}</div>
      <div class="sig-line" style="margin-top: 20px;"></div>
      <div class="sig-title">Authorized Signatory</div>
      <div class="sig-sub">Certified Computer Generated Tax Invoice</div>
    </div>
  </div>
</body>
</html>`);
    frameDoc.close();
    setTimeout(() => { printFrame.contentWindow.print(); setTimeout(() => document.body.removeChild(printFrame), 1000); }, 500);
  };

  const handleShareWhatsApp = () => {
    const phone = customer.phone ? customer.phone.replace(/\D/g, '') : '';
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    
    const itemLines = safeItems.map((d, i) => {
      const mkLabel = getMakingModeLabel(d);
      const huidText = d.huid ? ` [HUID: ${d.huid}]` : '';
      return `${i + 1}. ${d.name} (${d.karat || ''}K ${(d.material || 'gold').charAt(0).toUpperCase() + (d.material || 'gold').slice(1)}${d.weight ? ` ${d.weight}g` : ''}, Making: ${mkLabel}${huidText}) - Rs.${(d.totalPrice * d.quantity).toLocaleString('en-IN')}`;
    }).join('%0a');
    
    const message = [
      `*${STORE_CONFIG.name.toUpperCase()}*`,
      `Store Billing Invoice`,
      `---`,
      `Bill: ${billNumber}`,
      `Date: ${invoiceDate} | ${invoiceTime}`,
      `Customer: ${customer.name || 'Walk-in Customer'}`,
      `---`,
      `*Items:*`,
      itemLines,
      `---`,
      `Subtotal: Rs.${subtotal.toLocaleString('en-IN')}`,
      computedTotalGst > 0 ? `GST (${rateNum}%): Rs.${computedTotalGst.toLocaleString('en-IN')}` : '',
      discountAmount > 0 ? `Discount: -Rs.${discountAmount.toLocaleString('en-IN')}` : '',
      oldGoldDeduction > 0 ? `Old Gold: -Rs.${oldGoldDeduction.toLocaleString('en-IN')}` : '',
      `---`,
      `*Total Payable: Rs.${totalPayable.toLocaleString('en-IN')}*`,
      `In Words: ${numberToIndianWords(totalPayable)}`,
      `Payment: ${paymentMethod.toUpperCase()}`,
      `---`,
      `Gold Rate: Rs.${Number(goldRateUsed).toLocaleString('en-IN')}/g`,
      `BIS Hallmarked | GSTIN: ${STORE_CONFIG.gstin}`,
      paymentStatus && paymentStatus !== 'paid' && paymentStatus !== 'settled' ? `---` : '',
      paymentStatus === 'partially_paid' ? `*PARTIALLY PAID*` : '',
      paymentStatus === 'pending' ? `*PAYMENT PENDING*` : '',
      paymentStatus && paymentStatus !== 'paid' && paymentStatus !== 'settled' ? `Paid: Rs.${amountPaid.toLocaleString('en-IN')}` : '',
      paymentStatus && paymentStatus !== 'paid' && paymentStatus !== 'settled' ? `*Balance Due: Rs.${balanceRemaining.toLocaleString('en-IN')}*` : '',
      dueDate && paymentStatus !== 'paid' && paymentStatus !== 'settled' ? `Due By: ${new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
      `Thank you for choosing ${STORE_CONFIG.name}.`
    ].filter(Boolean).join('%0a');
    
    const url = formattedPhone 
      ? `https://wa.me/${formattedPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    
    window.open(url, '_blank');
  };

  const handleThermalPrint = () => {
    const thermalFrame = document.createElement('iframe');
    thermalFrame.style.display = 'none';
    document.body.appendChild(thermalFrame);
    const tDoc = thermalFrame.contentDocument || thermalFrame.contentWindow.document;

    const itemsHtml = safeItems.map((d, i) => {
      const mat = (d.material || 'gold').charAt(0).toUpperCase() + (d.material || 'gold').slice(1);
      const mkLabel = getMakingModeLabel(d);
      const huidText = d.huid ? ' | HUID: ' + d.huid : '';
      return '<div style="padding:2px 0;"><div class="item-row"><span class="item-name">' + (i + 1) + '. ' + (d.name || 'Jewelry').substring(0, 28) + '</span><span class="bold">Rs.' + (d.totalPrice * d.quantity).toLocaleString('en-IN') + '</span></div><div style="font-size:9px;color:#555;padding-left:14px;">' + mat + ' ' + (d.karat || '') + 'K ' + (d.weight ? d.weight + 'g' : '') + ' | Mk: ' + mkLabel + huidText + ' x' + d.quantity + '</div></div>';
    }).join('');

    const gstLine = computedTotalGst > 0 ? '<div class="summary-row"><span>GST (' + rateNum + '%):</span><span>Rs.' + computedTotalGst.toLocaleString('en-IN') + '</span></div>' : '';
    const discountLine = discountAmount > 0 ? '<div class="summary-row" style="color:#333;"><span>Discount:</span><span>-Rs.' + discountAmount.toLocaleString('en-IN') + '</span></div>' : '';
    const oldGoldLine = oldGoldDeduction > 0 ? '<div class="summary-row"><span>Old Gold:</span><span>-Rs.' + oldGoldDeduction.toLocaleString('en-IN') + '</span></div>' : '';
    const cashLine = paymentMethod === 'cash' && cashReceived > 0 ? '<div class="summary-row"><span>Cash Received:</span><span>Rs.' + cashReceived.toLocaleString('en-IN') + '</span></div><div class="summary-row"><span>Change:</span><span>Rs.' + changeReturned.toLocaleString('en-IN') + '</span></div>' : '';

    tDoc.open();
    tDoc.write(`<html><head><title>Thermal Receipt</title><style>
      @page { size: 80mm auto; margin: 2mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Courier New', monospace; font-size: 11px; width: 76mm; color: #000; line-height: 1.4; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: 700; }
      .divider { border-top: 1px dashed #000; margin: 4px 0; }
      .brand { font-size: 16px; font-weight: 700; letter-spacing: 2px; margin-bottom: 2px; }
      .sub { font-size: 8px; color: #555; }
      .item-row { display: flex; justify-content: space-between; padding: 2px 0; }
      .item-name { max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; padding: 4px 0; }
      .summary-row { display: flex; justify-content: space-between; font-size: 10px; padding: 1px 0; }
    </style></head><body>
      <div class="center">
        <div class="brand">${STORE_CONFIG.name.toUpperCase()}</div>
        <div class="sub">${STORE_CONFIG.tagline.toUpperCase()}</div>
        <div class="sub">${STORE_CONFIG.address.city}, ${STORE_CONFIG.address.pincode}</div>
        <div class="sub">GSTIN: ${STORE_CONFIG.gstin}</div>
      </div>
      <div class="divider"></div>
      <div class="item-row"><span>Bill: ${billNumber}</span><span>${invoiceDate}</span></div>
      <div class="item-row"><span>${customer.name || 'Walk-in'}</span><span>${customer.phone || ''}${customer.panNumber ? ' | PAN: ' + customer.panNumber : ''}</span></div>
      <div class="divider"></div>
      ${itemsHtml}
      <div class="divider"></div>
      <div class="summary-row"><span>Subtotal:</span><span>Rs.${subtotal.toLocaleString('en-IN')}</span></div>
      ${gstLine}
      ${discountLine}
      ${oldGoldLine}
      <div class="divider"></div>
      <div class="total-row"><span>TOTAL:</span><span>Rs.${totalPayable.toLocaleString('en-IN')}</span></div>
      <div style="font-size:9px;font-style:italic;margin-bottom:4px;">Words: ${numberToIndianWords(totalPayable)}</div>
      <div class="summary-row"><span>Payment:</span><span class="bold">${paymentMethod.toUpperCase()}</span></div>
      ${cashLine}
      ${paymentStatus && paymentStatus !== 'paid' && paymentStatus !== 'settled' ? `
      <div class="divider"></div>
      <div class="summary-row bold" style="color:#B00;"><span>${paymentStatus === 'pending' ? 'PAYMENT PENDING' : 'PARTIALLY PAID'}</span><span></span></div>
      <div class="summary-row"><span>Paid:</span><span>Rs.${amountPaid.toLocaleString('en-IN')}</span></div>
      <div class="summary-row bold"><span>Balance:</span><span>Rs.${balanceRemaining.toLocaleString('en-IN')}</span></div>
      ${dueDate ? '<div class="summary-row"><span>Due:</span><span>' + new Date(dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + '</span></div>' : ''}
      ` : ''}
      <div class="divider"></div>
      <div class="summary-row"><span>Gold Rate:</span><span>Rs.${Number(goldRateUsed).toLocaleString('en-IN')}/g</span></div>
      <div class="summary-row"><span>Silver Rate:</span><span>Rs.${Number(silverRateUsed).toLocaleString('en-IN')}/g</span></div>
      <div class="divider"></div>
      <div class="center" style="font-size:9px;margin-top:4px;">
        <div>BIS Hallmarked | HSN: 7113</div>
        <div>Computer Generated Invoice</div>
        <div style="margin-top:4px;font-weight:700;">Thank you for visiting</div>
        <div style="font-weight:700;">${STORE_CONFIG.name}</div>
      </div>
    </body></html>`);
    tDoc.close();
    setTimeout(() => { thermalFrame.contentWindow.print(); setTimeout(() => document.body.removeChild(thermalFrame), 1000); }, 500);
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
                <h2 className="font-heading text-2xl font-bold text-[#111111] tracking-wider">{STORE_CONFIG.name.toUpperCase()}</h2>
                <p className="text-[10px] font-body text-gray-400 uppercase tracking-[0.15em] mt-0.5">{STORE_CONFIG.tagline}</p>
                <p className="text-[9px] font-body text-gray-400 mt-1">GSTIN: {STORE_CONFIG.gstin} | HSN: {STORE_CONFIG.hsn} | BIS: {STORE_CONFIG.bisLicense}</p>
                <p className="text-[9px] font-body text-gray-400">{STORE_CONFIG.address.full}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-body font-bold text-[#B59A6C] uppercase tracking-[0.15em] block">{rateNum > 0 ? 'Tax Invoice' : 'Bill of Supply'}</span>
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
                {customer.panNumber && <p className="text-[10px] font-mono text-[#B59A6C] font-bold mt-0.5">PAN (Rule 114B): {customer.panNumber}</p>}
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

            {/* Item Table with Dedicated Photo Column */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-body">
                <thead>
                  <tr className="bg-[#111111] text-white">
                    <th className="py-2.5 px-2 text-center font-bold uppercase tracking-wider text-[10px] w-7">#</th>
                    <th className="py-2.5 px-2 text-center font-bold uppercase tracking-wider text-[10px] w-14">Photo</th>
                    <th className="py-2.5 px-3 text-left font-bold uppercase tracking-wider text-[10px]">Ornament & HUID</th>
                    <th className="py-2.5 px-3 text-left font-bold uppercase tracking-wider text-[10px]">Spec / Purity</th>
                    <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider text-[10px]">Gross / Net</th>
                    <th className="py-2.5 px-2 text-center font-bold uppercase tracking-wider text-[10px] w-10">Qty</th>
                    <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider text-[10px]">Rate & Making</th>
                    <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider text-[10px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {safeItems.map((d, idx) => {
                    const mat = (d.material || 'gold').charAt(0).toUpperCase() + (d.material || 'gold').slice(1);
                    const grossWt = Number(d.weight || d.netWeight || 0);
                    const netWt = Number(d.netWeight || d.weight || 0);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 border-b border-gray-100">
                        <td className="py-3 px-2 text-center font-mono text-gray-500 font-bold">{idx + 1}</td>
                        <td className="py-2 px-2 text-center">
                          {d.image ? (
                            <img
                              src={d.image}
                              alt={d.name || 'Product'}
                              className="w-12 h-12 object-cover border border-[#B59A6C]/40 rounded-xs mx-auto bg-[#FAF9F7] shadow-2xs"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xs border border-dashed border-gray-300 mx-auto flex items-center justify-center text-[9px] text-gray-400 bg-gray-50 font-sans">
                              No Pic
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-heading font-bold text-[#111111] leading-snug break-words">{d.name || 'Fine Jewelry Piece'}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-body text-gray-400 uppercase tracking-wider">HSN: 7113 | BIS Hallmarked</span>
                            {d.huid && (
                              <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 bg-[#B59A6C]/10 text-[#B59A6C] border border-[#B59A6C]/30 tracking-widest uppercase rounded-2xs">
                                HUID: {d.huid}
                              </span>
                            )}
                          </div>
                          {d.gemstoneCost > 0 && (
                            <div className="mt-0.5 text-[9px] text-gray-500 font-mono">
                              Diamond / Gemstones: Rs.{(d.gemstoneCost * d.quantity).toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-700">
                          <div className="font-bold">{mat} {d.karat ? `${d.karat}K` : ''}</div>
                          <div className="text-[10px] text-gray-500">{(d.purityPercent || 91.67).toFixed(1)}% Purity</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-xs">
                          <div className="text-gray-500 text-[10px]">Gr: {grossWt.toFixed(3)}g</div>
                          <div className="font-bold text-[#111111]">Net: {netWt.toFixed(3)}g</div>
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold">{d.quantity || 1}</td>
                        <td className="py-3 px-3 text-right font-mono text-[11px]">
                          <div>Rs.{(d.ratePerGram || 0).toLocaleString('en-IN')}/g</div>
                          <div className="text-[9px] text-gray-500">Mk: Rs.{((d.makingCharges || 0) * (d.quantity || 1)).toLocaleString('en-IN')} ({getMakingModeLabel(d)})</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-sm whitespace-nowrap text-[#07162C]">
                          Rs. {((d.totalPrice || 0) * (d.quantity || 1)).toLocaleString('en-IN')}
                        </td>
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
                {computedTotalGst > 0 ? (
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center font-bold text-[#111111]">
                      <span>Total GST ({rateNum}%):</span>
                      <span className="font-mono whitespace-nowrap">Rs.{computedTotalGst.toLocaleString('en-IN')}</span>
                    </div>
                    {!isSingle && (
                      <div className="flex justify-between items-center text-[10px] text-gray-500 pl-2">
                        <span>CGST ({cgstPercent}%): Rs.{cgst.toLocaleString('en-IN')}</span>
                        <span>SGST ({sgstPercent}%): Rs.{sgst.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-gray-500">
                    <span>GST (0% Exempt):</span>
                    <span className="font-mono">Rs.0</span>
                  </div>
                )}
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
                <div className="text-[10px] italic text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1.5 mt-1 rounded">
                  <span className="font-bold text-[#111111] not-italic">In Words: </span>
                  {numberToIndianWords(totalPayable)}
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
                {/* Phase 6: Partial Payment Status */}
                {paymentStatus && paymentStatus !== 'paid' && (
                  <div className={`mt-2 p-2.5 border ${paymentStatus === 'settled' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-mono font-bold uppercase ${paymentStatus === 'settled' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {paymentStatus === 'settled' ? 'FULLY SETTLED' : paymentStatus === 'pending' ? 'PAYMENT PENDING' : 'PARTIALLY PAID'}
                      </span>
                    </div>
                    {paymentStatus !== 'settled' && (
                      <>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span>Amount Paid:</span>
                          <span className="font-mono font-bold text-[#111111]">Rs.{amountPaid.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold">Balance Due:</span>
                          <span className="font-mono font-extrabold text-rose-700">Rs.{balanceRemaining.toLocaleString('en-IN')}</span>
                        </div>
                        {dueDate && (
                          <div className="flex justify-between items-center text-[10px] mt-0.5">
                            <span>Due By:</span>
                            <span className="font-mono font-bold">{new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                      </>
                    )}
                    {paymentEntries.length > 0 && (
                      <div className="mt-2 border-t border-gray-200 pt-1.5">
                        <span className="text-[9px] font-body font-bold text-gray-500 uppercase block mb-1">Payment History</span>
                        {paymentEntries.map((pe, idx) => (
                          <div key={idx} className="flex justify-between text-[10px] font-mono text-gray-600">
                            <span>{new Date(pe.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} | {(pe.method || 'cash').toUpperCase()}</span>
                            <span className="font-bold">Rs.{(pe.amount || 0).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Anti-Fraud Photographic Verification Notice Banner */}
            <div className="bg-[#FCFAF6] border border-[#B59A6C] border-l-4 border-l-[#B59A6C] p-3 rounded-xs flex items-start gap-3">
              <ShieldCheckIcon size={20} className="text-[#B59A6C] shrink-0 mt-0.5" />
              <div className="text-[10px] font-body text-gray-600 leading-relaxed">
                <span className="font-bold text-[#07162C] uppercase tracking-wider block text-[11px] mb-0.5">
                  Anti-Fraud & Photographic Article Verification Notice
                </span>
                This certified GST Tax Invoice features high-resolution photographic verification of the exact article(s) delivered to the customer at the counter. All pieces are hallmarked under BIS IS 1417:2016 standards with unique 6-character HUID laser codes. To prevent item substitution fraud, all buyback, exchange, or claim requests are strictly verified against the printed photograph, certified net weight, and HUID recorded on this invoice.
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
                  <span className="font-heading text-xs italic text-[#B59A6C] tracking-widest font-bold">{STORE_CONFIG.name}</span>
                </div>
                <span className="text-[9px] font-body text-gray-400 uppercase tracking-widest block">AUTHORIZED SIGNATORY</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#222222] text-white py-3 text-xs font-body font-bold uppercase tracking-wider hover:bg-[#B59A6C] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <DownloadIcon size={16} />
                  {downloading ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 border border-[#222222] text-[#222222] py-3 text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
                >
                  <ShieldCheckIcon size={16} />
                  Print A4 Invoice
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleThermalPrint}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 text-[10px] font-body font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Thermal Receipt (80mm)
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 text-[10px] font-body font-bold uppercase tracking-wider hover:bg-[#128C7E] transition-colors cursor-pointer"
                >
                  Share via WhatsApp
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-500 text-xs font-body font-bold uppercase tracking-wider hover:text-[#111111] transition-colors cursor-pointer"
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
