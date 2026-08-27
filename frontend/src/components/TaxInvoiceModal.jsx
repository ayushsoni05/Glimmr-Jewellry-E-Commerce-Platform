import { motion, AnimatePresence } from 'framer-motion';
import { getProductImage } from '../utils/productImages';
import { ShieldCheckIcon, DownloadIcon, CheckCircleIcon } from './Icons';
import { useMetalRates } from '../contexts/MetalRatesContext';

const TaxInvoiceModal = ({ isOpen, onClose, order }) => {
  const { getLiveProductPrice } = useMetalRates ? useMetalRates() : { getLiveProductPrice: () => null };

  if (!isOpen || !order) return null;

  // Calculate detailed live pricing for every item to guarantee 100% mathematical consistency
  const getItemBreakdown = (p, storedPrice) => {
    if (typeof getLiveProductPrice === 'function') {
      const live = getLiveProductPrice(p);
      if (live && live.totalLivePrice > 0) return live;
    }
    const price = storedPrice || Number(p?.price) || 0;
    const sub = Math.round(price / 1.03);
    const gst = price - sub;
    return {
      rawMetalCost: sub,
      makingCharges: 0,
      gemstoneCost: 0,
      subtotal: sub,
      gstTax: gst,
      totalLivePrice: price,
      weight: Number(p?.weight || p?.metalWeight || 0),
      karat: Number(p?.karat || 22),
      material: p?.material || 'Gold'
    };
  };

  const itemDetails = (order.items || []).map((item) => {
    const p = item.product || {};
    const bd = getItemBreakdown(p, item.price);
    const qty = item.quantity || 1;
    return {
      item,
      product: p,
      quantity: qty,
      unitSubtotal: bd.subtotal,
      unitTotal: bd.totalLivePrice,
      metalCost: bd.rawMetalCost,
      makingCharges: bd.makingCharges,
      gemstoneCost: bd.gemstoneCost,
      gstTax: bd.gstTax,
      lineSubtotal: bd.subtotal * qty,
      lineTotal: bd.totalLivePrice * qty,
      lineGst: bd.gstTax * qty,
      weight: bd.weight,
      karat: bd.karat,
      material: bd.material
    };
  });

  const subtotal = itemDetails.reduce((sum, d) => sum + d.lineSubtotal, 0);
  const totalTax = itemDetails.reduce((sum, d) => sum + d.lineGst, 0);
  const cgst = Math.round(totalTax / 2);
  const sgst = totalTax - cgst;
  const totalPayable = order.totalAmount > 0 ? order.totalAmount : (subtotal + totalTax);

  const invoiceNo = `INV-2026-${(order._id || '1000').slice(-6).toUpperCase()}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleDownloadPDF = () => {
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

    const renderNativePDF = async () => {
      if (!window.jspdf) return;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Preload all product images
      const imagePromises = itemDetails.map((d) => loadImageAsBase64(getProductImage(d.product)));
      const imageDataArr = await Promise.all(imagePromises);

      // Top Gold Accent Bar
      doc.setFillColor(181, 154, 108);
      doc.rect(0, 0, 210, 4, 'F');

      // Header: Brand Title & Official Details
      doc.setFont('times', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(17, 17, 17);
      doc.text('GLIMMR ATELIER', 15, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text('HAUTE JOAILLERIE & CERTIFIED FINE JEWELRY', 15, 25);
      doc.text('GSTIN: 27AAAAA0000A1Z5   •   HSN Code: 7113   •   BIS License: HM-916-84920', 15, 29);
      doc.text('Atelier Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051', 15, 33);

      // Header: Invoice Metadata Right Block
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(181, 154, 108);
      doc.text('OFFICIAL TAX INVOICE', 195, 18, { align: 'right' });

      doc.setFontSize(11);
      doc.setTextColor(17, 17, 17);
      doc.text(invoiceNo, 195, 24, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${invoiceDate}`, 195, 29, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 122, 59);
      doc.text(`Status: ${(order.status || 'CONFIRMED').toUpperCase()}`, 195, 34, { align: 'right' });

      // Divider Line
      doc.setDrawColor(229, 226, 217);
      doc.setLineWidth(0.4);
      doc.line(15, 38, 195, 38);

      // Customer & Shipping Box
      doc.setFillColor(250, 249, 247);
      doc.rect(15, 42, 180, 28, 'F');
      doc.setDrawColor(229, 226, 217);
      doc.rect(15, 42, 180, 28, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(181, 154, 108);
      doc.text('BILLED & SHIPPED TO', 20, 48);

      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 17, 17);
      const clientName = order.shippingAddress?.name || 'Valued Atelier Client';
      doc.text(clientName, 20, 53);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const line1 = order.shippingAddress?.line1 || '';
      const line2 = order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : '';
      const cityState = `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}`;
      const phone = `Phone: ${order.shippingAddress?.phone || 'N/A'}`;
      doc.text(`${line1}${line2}`, 20, 58);
      doc.text(`${cityState} • ${phone}`, 20, 63);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(181, 154, 108);
      doc.text('ORDER REFERENCE', 120, 48);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`Order ID: #${(order._id || '').toUpperCase()}`, 120, 53);
      doc.text(`Payment Method: ${(order.paymentMethod || 'COD').toUpperCase()}`, 120, 58);
      doc.text(`Place of Supply: ${order.shippingAddress?.state || 'Maharashtra'}`, 120, 63);

      // Table Header Bar
      let y = 76;
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

      // Table Rows with Product Images & Breakdown
      y += 8;

      itemDetails.forEach((d, index) => {
        const p = d.product || {};
        const imgData = imageDataArr[index];

        // Product Image (if available)
        const textX = imgData ? 32 : 20;
        if (imgData) {
          try {
            doc.addImage(imgData, 'JPEG', 20, y + 1, 10, 10);
          } catch { /* skip */ }
        }

        // Item Name
        doc.setFont('times', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(17, 17, 17);
        const prodName = p.name || 'Fine Jewelry Piece';
        doc.text(prodName.length > 35 ? prodName.substring(0, 35) + '...' : prodName, textX, y + 5);

        // HSN / Hallmarking Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(140, 140, 140);
        doc.text('HSN: 7113 • BIS Hallmarked Certified', textX, y + 9);

        // Metal & Making breakdown
        if (d.weight > 0) {
          doc.setFontSize(6.5);
          doc.setTextColor(120, 120, 120);
          doc.text(`Metal: Rs.${(d.metalCost * d.quantity).toLocaleString('en-IN')}  |  Making: Rs.${(d.makingCharges * d.quantity).toLocaleString('en-IN')}`, textX, y + 12.5);
        }

        // Purity & Weight
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        const spec = `${d.material} ${d.karat ? d.karat + 'K' : ''} ${d.weight ? '• ' + d.weight + 'g' : ''}`;
        doc.text(spec, 105, y + 6);

        // Qty, Unit Price, Total
        doc.text(String(d.quantity), 140, y + 6, { align: 'center' });
        doc.text(`Rs. ${d.unitTotal.toLocaleString('en-IN')}`, 165, y + 6, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 17, 17);
        doc.text(`Rs. ${d.lineTotal.toLocaleString('en-IN')}`, 190, y + 6, { align: 'right' });

        y += (d.weight > 0 ? 16 : 12);
        doc.setDrawColor(230, 230, 230);
        doc.line(15, y, 195, y);
      });

      // Declaration & Financial Summary Area
      y += 6;
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

      // Financial Calculation Block
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

      doc.setDrawColor(17, 17, 17);
      doc.setLineWidth(0.4);
      doc.line(140, y + 17, 195, y + 17);

      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(17, 17, 17);
      doc.text('Total Payable:', 140, y + 23);
      doc.text(`Rs. ${totalPayable.toLocaleString('en-IN')}`, 190, y + 23, { align: 'right' });

      // Footer Seal & Signatory
      y += 32;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(15, y, 195, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text('Computer Generated Certified GST Invoice', 15, y + 6);

      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(181, 154, 108);
      doc.text('Glimmr Atelier', 195, y + 5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      doc.text('AUTHORIZED SIGNATORY', 195, y + 9, { align: 'right' });

      // Save PDF file directly to downloads
      doc.save(`Tax_Invoice_${invoiceNo}.pdf`);
    };

    if (window.jspdf) {
      renderNativePDF();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => renderNativePDF();
      document.body.appendChild(script);
    }
  };

  const handlePrint = () => {
    const printElement = document.getElementById('printable-tax-invoice');
    if (!printElement) return;

    let iframe = document.getElementById('print-invoice-iframe');
    if (iframe) {
      document.body.removeChild(iframe);
    }
    iframe = document.createElement('iframe');
    iframe.id = 'print-invoice-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST Tax Invoice - ${invoiceNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=Fragment+Mono:wght@400;700&display=swap');
            * { box-sizing: border-box; }
            body { font-family: 'DM Sans', system-ui, sans-serif; background: #ffffff; color: #111111; margin: 0; padding: 24px; font-size: 11px; line-height: 1.5; }
            h1, h2, h3, .font-heading { font-family: 'Playfair Display', Georgia, serif; }
            .font-mono { font-family: 'Fragment Mono', monospace; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .uppercase { text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 16px 0; }
            th { background: #111111; color: #ffffff; padding: 8px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; text-align: left; }
            td { padding: 8px 10px; border-bottom: 1px solid #e5e2d9; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
            .bg-[#FAF9F7] { background-color: #FAF9F7; }
            .border-[#E5E2D9] { border-color: #E5E2D9; }
            .border-[#E8C8C1] { border-color: #E8C8C1; }
            .bg-[#FDF2F0] { background-color: #FDF2F0; }
            .text-[#B59A6C] { color: #B59A6C; }
            .text-[#111111] { color: #111111; }
            .gold-bar { height: 4px; width: 100%; background: linear-gradient(to right, #B59A6C, #111111, #B59A6C); margin-bottom: 16px; }
            @page { size: A4 portrait; margin: 8mm; }
          </style>
        </head>
        <body>
          <div class="gold-bar"></div>
          ${printElement.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#111111]/70 backdrop-blur-md p-3 sm:p-6 flex items-start sm:items-center justify-center">
        
        {/* Backdrop overlay click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-white border border-[#E5E2D9] shadow-[0_25px_60px_rgba(0,0,0,0.15)] z-10 overflow-hidden my-auto"
        >
          
          {/* Top Control Bar (Sticky & Always Visible) */}
          <div className="sticky top-0 z-20 bg-[#FAF9F7] border-b border-[#E5E2D9] px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-body font-bold text-[#111111] uppercase tracking-wider">
              <ShieldCheckIcon size={18} className="text-[#B59A6C]" />
              <span>Official GST Tax Invoice &bull; Glimmr Atelier</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-[#111111] text-[#FAF9F7] text-xs font-body font-bold uppercase tracking-wider hover:bg-[#222222] transition-colors cursor-pointer flex items-center gap-2"
              >
                <DownloadIcon size={14} className="text-[#B59A6C]" />
                <span>Download PDF</span>
              </motion.button>

              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-body font-bold uppercase tracking-wider hover:bg-gray-100 hover:text-[#111111] transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
                title="Print Paper Copy"
              >
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#111111] hover:border-[#111111] flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                title="Close"
              >
                &#x2715;
              </button>
            </div>
          </div>

          {/* Printable Invoice Paper Area (Internally Scrollable) */}
          <div className="p-6 sm:p-8 space-y-6 bg-white overflow-y-auto flex-1 font-body text-[#111111]" id="printable-tax-invoice">
            
            {/* Top Gold Accent Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#B59A6C] via-[#111111] to-[#B59A6C]" />

            {/* Letterhead Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-200 pb-5">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#111111] tracking-wider uppercase mb-1">
                  GLIMMR ATELIER
                </h1>
                <p className="text-[10px] font-body text-gray-500 uppercase tracking-[0.2em]">
                  HAUTE JOAILLERIE & CERTIFIED FINE JEWELRY
                </p>
                <p className="text-[10px] font-body text-gray-500 mt-2 leading-relaxed">
                  GSTIN: <span className="font-mono font-bold text-[#111111]">27AAAAA0000A1Z5</span> &bull; HSN Code: <span className="font-mono font-bold text-[#111111]">7113</span><br />
                  BIS License: <span className="font-mono font-bold text-[#111111]">HM-916-84920</span><br />
                  Atelier Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="px-3 py-1 bg-[#FDF2F0] border border-[#E8C8C1] text-[#B59A6C] text-[10px] font-body font-bold uppercase tracking-widest block w-max sm:ml-auto mb-2">
                  TAX INVOICE
                </span>
                <p className="font-mono text-sm font-extrabold text-[#111111]">{invoiceNo}</p>
                <p className="text-xs font-body text-gray-500 mt-0.5">Date: {invoiceDate}</p>
                <p className="text-xs font-body text-emerald-700 font-bold uppercase mt-1">Status: {order.status?.toUpperCase() || 'CONFIRMED'}</p>
              </div>
            </div>

            {/* Address & Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FAF9F7] border border-gray-200">
              <div>
                <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block mb-1">
                  BILLED & SHIPPED TO
                </span>
                <p className="font-heading font-bold text-sm text-[#111111]">
                  {order.shippingAddress?.name || 'Valued Atelier Client'}
                </p>
                <p className="text-xs font-body text-gray-600 leading-relaxed mt-1">
                  {order.shippingAddress?.line1}
                  {order.shippingAddress?.line2 && `, ${order.shippingAddress.line2}`}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="font-mono font-bold">{order.shippingAddress?.pincode}</span><br />
                  {order.shippingAddress?.country || 'India'} &bull; Phone: {order.shippingAddress?.phone}
                </p>
              </div>

              <div className="sm:border-l sm:border-gray-200 sm:pl-4">
                <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block mb-1">
                  ORDER REFERENCE
                </span>
                <div className="text-xs font-body text-gray-600 space-y-1">
                  <div>Order ID: <span className="font-mono font-bold text-[#111111]">#{order._id?.toUpperCase()}</span></div>
                  <div>Payment Mode: <span className="font-body font-bold text-[#111111] uppercase">{order.paymentMethod || 'COD'}</span></div>
                  <div>Place of Supply: <span className="font-body font-bold text-[#111111]">{order.shippingAddress?.state || 'Maharashtra'}</span></div>
                </div>
              </div>
            </div>

            {/* Fixed Table Width Layout with Product Images and Breakdown */}
            <div className="w-full overflow-hidden border border-gray-200">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#111111] text-[#FAF9F7] text-[9px] font-body uppercase tracking-widest">
                    <th className="py-2.5 px-3 w-[44%]">Item Description</th>
                    <th className="py-2.5 px-3 w-[18%]">Spec / Purity</th>
                    <th className="py-2.5 px-3 w-[8%] text-center">Qty</th>
                    <th className="py-2.5 px-3 w-[15%] text-right">Unit Price</th>
                    <th className="py-2.5 px-3 w-[15%] text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs font-body text-[#111111]">
                  {itemDetails.map((d, idx) => {
                    const p = d.product || {};
                    const imgSrc = getProductImage(p);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3 break-words">
                          <div className="flex items-start gap-2.5">
                            <img 
                              src={imgSrc} 
                              alt={p.name || 'Product'} 
                              className="w-10 h-10 object-cover border border-gray-200 shrink-0 bg-[#FAF9F7]" 
                            />
                            <div className="min-w-0">
                              <p className="font-heading font-bold text-[#111111] leading-snug break-words">{p.name || 'Fine Jewelry Piece'}</p>
                              <span className="text-[9px] font-body text-gray-400 uppercase tracking-wider block mt-0.5">HSN: 7113 &bull; BIS Hallmarked</span>
                              {/* Per-item breakdown sub-details */}
                              {d.weight > 0 && (
                                <div className="mt-1 text-[9px] text-gray-500 space-y-0.5">
                                  <span className="block">Metal: ₹{(d.metalCost * d.quantity).toLocaleString('en-IN')} &bull; Making: ₹{(d.makingCharges * d.quantity).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-600 break-words">
                          {d.material} {d.karat ? `${d.karat}K` : ''} {d.weight ? `• ${d.weight}g` : ''}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold">{d.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">₹{d.unitTotal.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">₹{d.lineTotal.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Subtotal & GST Tax Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2 border-t border-gray-200">
              <div className="text-[10px] font-body text-gray-500 space-y-1 max-w-xs">
                <p className="font-bold text-[#111111] uppercase tracking-wider">Declaration & Terms:</p>
                <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Gold and Silver jewelry is 100% BIS Hallmarked.</p>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs font-body text-gray-600 shrink-0">
                <div className="flex justify-between items-center">
                  <span>Subtotal (Before Tax):</span>
                  <span className="font-mono font-bold text-[#111111] whitespace-nowrap">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>CGST (1.5%):</span>
                  <span className="font-mono text-gray-700 whitespace-nowrap">₹{cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SGST (1.5%):</span>
                  <span className="font-mono text-gray-700 whitespace-nowrap">₹{sgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-2 text-sm">
                  <span className="font-heading font-extrabold text-[#111111]">Total Payable:</span>
                  <span className="font-mono font-extrabold text-[#111111] whitespace-nowrap">₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Authorized Signatory & Seal */}
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

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaxInvoiceModal;
