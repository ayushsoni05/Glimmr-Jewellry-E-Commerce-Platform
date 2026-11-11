import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DIDWANA_ZONE,
  formatDesignInquiryMessage,
  formatVideoInspectionRequest
} from '../utils/deliveryZone';
import { DAILY_IBJA_RATES } from './GoldRateCalculator';

const TABS = [
  { id: 'inquiry', label: 'Design Availability' },
  { id: 'tryon', label: 'Showroom Try-On' },
  { id: 'exchange', label: 'Old Gold Exchange' },
  { id: 'videocall', label: 'Live Video Inspection' }
];

const PURITY_LIST = [
  '22K (916 BIS Hallmark Gold)',
  '24K (999 Pure Fine Gold)',
  '18K (750 Diamond Setting Gold)',
  '925 Sterling Fine Silver'
];

const PRESET_CHIPS = [
  'Is this exact piece ready in your Didwana showroom right now?',
  'Can I see live video or real camera photos on WhatsApp?',
  'Can you customize this with my family old gold exchange?',
  'What is the making charge breakdown on this piece?',
  'Can this design be made in a lighter budget weight?'
];

const FULFILLMENT_OPTIONS = [
  'Doorstep Handover in Didwana (PIN: 341303)',
  'In-Person Showroom Pickup (Monika Jewellers Didwana)',
  'Outside Didwana - Special Insured Delivery Request'
];

const OLD_GOLD_PURITIES = [
  { label: '22K (91.6% Pure)', factor: 0.916 },
  { label: '20K (83.3% Pure Traditional)', factor: 0.833 },
  { label: '18K (75.0% Pure)', factor: 0.750 },
  { label: '14K (58.5% Pure)', factor: 0.585 }
];

const DesignInquiryModal = ({ isOpen, onClose, product = {}, defaultTab = 'inquiry' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Mode 1: Inquiry State
  const [selectedPurity, setSelectedPurity] = useState(PURITY_LIST[0]);
  const [selectedSize, setSelectedSize] = useState('Standard Size');
  const [targetWeight, setTargetWeight] = useState(product?.weight ? `${product.weight}g` : 'Standard Weight');
  const [deliveryPreference, setDeliveryPreference] = useState(FULFILLMENT_OPTIONS[0]);
  const [selectedChip, setSelectedChip] = useState(PRESET_CHIPS[0]);
  const [customNote, setCustomNote] = useState('');

  // Mode 2: Try-On State
  const [patronName, setPatronName] = useState('');
  const [tryOnDate, setTryOnDate] = useState('');
  const [tryOnTime, setTryOnTime] = useState('11:30 AM');
  const [guestsCount, setGuestsCount] = useState('1-2 Guests');

  // Mode 3: Old Gold Exchange State
  const [oldGoldGrams, setOldGoldGrams] = useState(10);
  const [oldGoldPurityIndex, setOldGoldPurityIndex] = useState(0);

  // Mode 4: Video Call State
  const [videoDate, setVideoDate] = useState('');
  const [videoTime, setVideoTime] = useState('03:00 PM');
  const [videoPurpose, setVideoPurpose] = useState('View real camera luster and size');

  const exchangeValuation = useMemo(() => {
    const grams = Math.max(0, Number(oldGoldGrams) || 0);
    const purityObj = OLD_GOLD_PURITIES[oldGoldPurityIndex] || OLD_GOLD_PURITIES[0];
    const pureGoldRatePerGram = DAILY_IBJA_RATES.gold24k / 10;
    const estimatedValue = Math.round(grams * pureGoldRatePerGram * purityObj.factor);
    const productPrice = Number(product?.price) || 0;
    const netPayable = Math.max(0, productPrice - estimatedValue);

    return {
      grams,
      purityLabel: purityObj.label,
      estimatedValue,
      netPayable
    };
  }, [oldGoldGrams, oldGoldPurityIndex, product?.price]);

  if (!isOpen) return null;

  const handleSendInquiry = () => {
    const url = formatDesignInquiryMessage({
      product,
      purity: selectedPurity,
      size: selectedSize,
      targetWeight,
      deliveryPreference,
      inquiryType: 'Design Availability & Customization',
      quickChip: selectedChip,
      userNote: customNote
    });
    window.open(url, '_blank');
    onClose();
  };

  const handleSendTryOn = () => {
    const note = `Patron: ${patronName || 'Patron'} | Accompanied by: ${guestsCount}`;
    const url = formatDesignInquiryMessage({
      product,
      purity: selectedPurity,
      deliveryPreference: 'Showroom Visit (Didwana)',
      inquiryType: 'Showroom Try-On Appointment',
      appointmentDate: tryOnDate || 'Tomorrow',
      appointmentTime: tryOnTime,
      userNote: note
    });
    window.open(url, '_blank');
    onClose();
  };

  const handleSendExchange = () => {
    const url = formatDesignInquiryMessage({
      product,
      deliveryPreference,
      inquiryType: 'Old Gold Exchange Proposal',
      oldGoldGrams: exchangeValuation.grams,
      oldGoldPurity: exchangeValuation.purityLabel,
      oldGoldEstimate: exchangeValuation.estimatedValue,
      userNote: `Calculated net payable towards design: approx. Rs. ${exchangeValuation.netPayable.toLocaleString('en-IN')}`
    });
    window.open(url, '_blank');
    onClose();
  };

  const handleSendVideoCall = () => {
    const url = formatVideoInspectionRequest({
      product,
      preferredDate: videoDate || 'Today',
      preferredTime: videoTime,
      customerName: patronName || 'Patron'
    });
    window.open(url, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#1c1c1c] border border-white/20 text-white shadow-2xl z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-[#222222]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B59A6C]">
                  Monika Jewellers Didwana Atelier
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  Live WhatsApp Concierge
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-serif tracking-wide text-white">
                {product?.name || product?.title || 'Jewellery Design Inquiry'}
              </h2>
              <p className="text-xs font-mono text-white/60 mt-0.5">
                SKU: {product?.sku || product?._id || 'MJ-ATELIER'} | Didwana PIN 341303 Showroom Handover
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-2 border border-white/10 hover:border-white/30 text-xs font-mono transition-colors"
              aria-label="Close modal"
            >
              [ESC]
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/10 bg-[#161616]">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-2 text-xs font-body font-semibold tracking-wider uppercase transition-all border-b-2 text-center ${
                    isSelected
                      ? 'border-[#B59A6C] text-[#B59A6C] bg-[#222222]'
                      : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Modal Content Area */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs font-body">
            
            {/* TAB 1: DESIGN AVAILABILITY */}
            {activeTab === 'inquiry' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-2">
                    Metal Purity Preference
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PURITY_LIST.map((pur) => (
                      <button
                        key={pur}
                        type="button"
                        onClick={() => setSelectedPurity(pur)}
                        className={`p-2.5 text-left border text-xs transition-colors ${
                          selectedPurity === pur
                            ? 'border-[#B59A6C] bg-[#B59A6C]/10 text-white font-medium'
                            : 'border-white/10 bg-[#242424] text-white/70 hover:border-white/30'
                        }`}
                      >
                        {pur}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Size Preference
                    </label>
                    <input
                      type="text"
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      placeholder="e.g. Size 14, 2.6 Bangle, or 18 Inch"
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Target Weight
                    </label>
                    <input
                      type="text"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      placeholder="e.g. Approx 14g or Standard"
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-2">
                    Fulfillment Preference
                  </label>
                  <div className="space-y-1.5">
                    {FULFILLMENT_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        onClick={() => setDeliveryPreference(opt)}
                        className={`flex items-center gap-3 p-2.5 border cursor-pointer transition-colors ${
                          deliveryPreference === opt
                            ? 'border-[#B59A6C] bg-[#B59A6C]/10 text-white'
                            : 'border-white/10 bg-[#242424] text-white/70 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="fulfillment"
                          checked={deliveryPreference === opt}
                          onChange={() => setDeliveryPreference(opt)}
                          className="accent-[#B59A6C]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-2">
                    Quick Inquiry Question Chips
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSelectedChip(chip)}
                        className={`px-3 py-1.5 text-[11px] border text-left transition-colors ${
                          selectedChip === chip
                            ? 'bg-[#B59A6C] text-[#111111] border-[#B59A6C] font-semibold'
                            : 'bg-[#242424] text-white/80 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                    Custom Note or Family Request (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Enter any engraving text, auspicious delivery date, or specific gold requirement..."
                    className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                  />
                </div>

                <div className="p-3 bg-[#242424] border border-white/10 text-[11px] text-white/60">
                  <p className="font-semibold text-white mb-0.5">Direct Didwana Showroom Verification</p>
                  <p>Our artisans will immediately inspect current showroom stock in Didwana (341303) and respond via WhatsApp within minutes.</p>
                </div>
              </div>
            )}

            {/* TAB 2: SHOWROOM TRY-ON */}
            {activeTab === 'tryon' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#252525] border border-[#B59A6C]/30 text-xs">
                  <span className="font-semibold text-[#B59A6C] block uppercase tracking-wider mb-1">
                    Private VIP Viewing Suite (Didwana Showroom)
                  </span>
                  <p className="text-white/70">
                    Reserve this design in advance. Our showroom team will inspect, polish, and hold this piece ready in our private viewing tray for your scheduled visit.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={patronName}
                      onChange={(e) => setPatronName(e.target.value)}
                      placeholder="e.g. Soni Family"
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Guests Accompanying
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    >
                      <option>1-2 Guests</option>
                      <option>3-4 Family Members</option>
                      <option>Bridal Trousseau Delegation (5+ Guests)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={tryOnDate}
                      onChange={(e) => setTryOnDate(e.target.value)}
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Preferred Time Slot (Showroom Hours)
                    </label>
                    <select
                      value={tryOnTime}
                      onChange={(e) => setTryOnTime(e.target.value)}
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    >
                      <option>11:00 AM - Morning Slot</option>
                      <option>01:00 PM - Afternoon Slot</option>
                      <option>04:00 PM - High Tea Slot</option>
                      <option>06:30 PM - Evening Slot</option>
                      <option>07:30 PM - Extended VIP Slot</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-[#242424] border border-white/10 text-[11px] text-white/60">
                  <p>Showroom Address: Monika Jewellers, Main Bazaar, Didwana, Rajasthan (PIN: 341303).</p>
                  <p className="mt-0.5">Complimentary family hospitality, jeweler appraisal, and ring sizing included.</p>
                </div>
              </div>
            )}

            {/* TAB 3: OLD GOLD EXCHANGE */}
            {activeTab === 'exchange' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#252525] border border-[#B59A6C]/30 text-xs">
                  <span className="font-semibold text-[#B59A6C] block uppercase tracking-wider mb-1">
                    Monika Jewellers Purity Assayer Trade-In
                  </span>
                  <p className="text-white/70">
                    Trade in your existing family jewellery against this design at live 100% IBJA gold benchmark rates without hidden deductions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Old Gold Weight in Grams
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="500"
                      value={oldGoldGrams}
                      onChange={(e) => setOldGoldGrams(e.target.value)}
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Purity of Old Gold
                    </label>
                    <select
                      value={oldGoldPurityIndex}
                      onChange={(e) => setOldGoldPurityIndex(Number(e.target.value))}
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    >
                      {OLD_GOLD_PURITIES.map((item, idx) => (
                        <option key={item.label} value={idx}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calculation Card */}
                <div className="bg-[#242424] border border-white/10 p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-white/70">
                    <span>Target Design Price</span>
                    <span className="font-mono text-white">
                      {product?.price ? `Rs. ${Number(product.price).toLocaleString('en-IN')}` : 'To be confirmed'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>Estimated Trade-in Credit ({exchangeValuation.grams}g of {exchangeValuation.purityLabel})</span>
                    <span className="font-mono font-bold">- Rs. {exchangeValuation.estimatedValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center font-semibold text-sm">
                    <span className="text-[#B59A6C]">Estimated Net Amount to Pay</span>
                    <span className="font-mono text-[#B59A6C] text-base">
                      Rs. {exchangeValuation.netPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] font-mono text-white/50 text-center">
                  Final trade-in value verified with high-precision digital caratometer assay at our Didwana showroom.
                </p>
              </div>
            )}

            {/* TAB 4: LIVE VIDEO CALL */}
            {activeTab === 'videocall' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#252525] border border-[#B59A6C]/30 text-xs">
                  <span className="font-semibold text-[#B59A6C] block uppercase tracking-wider mb-1">
                    Live 1-on-1 WhatsApp Video Consultation
                  </span>
                  <p className="text-white/70">
                    Cannot visit the showroom in person today? Our master jeweler will present this exact piece live under studio jewelry lighting via WhatsApp video call.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={patronName}
                      onChange={(e) => setPatronName(e.target.value)}
                      placeholder="e.g. Soni Family"
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={videoDate}
                      onChange={(e) => setVideoDate(e.target.value)}
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Preferred Time Slot
                    </label>
                    <select
                      value={videoTime}
                      onChange={(e) => setVideoTime(e.target.value)}
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    >
                      <option>11:30 AM IST</option>
                      <option>01:30 PM IST</option>
                      <option>03:30 PM IST</option>
                      <option>05:30 PM IST</option>
                      <option>07:00 PM IST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#B59A6C] mb-1.5">
                      Inspection Focus
                    </label>
                    <input
                      type="text"
                      value={videoPurpose}
                      onChange={(e) => setVideoPurpose(e.target.value)}
                      placeholder="e.g. Diamond clarity or necklace drape"
                      className="w-full bg-[#242424] border border-white/20 p-2.5 text-white text-xs focus:outline-none focus:border-[#B59A6C]"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Action Buttons */}
          <div className="p-5 sm:p-6 border-t border-white/10 bg-[#222222] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-[11px] font-mono text-white/60 text-center sm:text-left">
              Direct Showroom Line: <span className="text-[#B59A6C] font-semibold">+91 9351214851</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-xs font-mono uppercase tracking-wider"
              >
                Cancel
              </button>
              
              {activeTab === 'inquiry' && (
                <button
                  type="button"
                  onClick={handleSendInquiry}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-body text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Send Inquiry on WhatsApp
                </button>
              )}

              {activeTab === 'tryon' && (
                <button
                  type="button"
                  onClick={handleSendTryOn}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#B59A6C] hover:bg-[#c4a97b] text-black font-body text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Confirm Showroom Appointment on WhatsApp
                </button>
              )}

              {activeTab === 'exchange' && (
                <button
                  type="button"
                  onClick={handleSendExchange}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#B59A6C] hover:bg-[#c4a97b] text-black font-body text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Submit Trade-In Estimate on WhatsApp
                </button>
              )}

              {activeTab === 'videocall' && (
                <button
                  type="button"
                  onClick={handleSendVideoCall}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-body text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Request Live Video Call on WhatsApp
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DesignInquiryModal;
