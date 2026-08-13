import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import GlimmrLogo from '../components/GlimmrLogo';

const GIFT_BOXES = [
  { id: 'gold-silk', name: 'Royal Gold Silk Box', price: 1500, color: '#B59A6C', desc: 'Embossed Gold Foil & Silk Ribbon' },
  { id: 'navy-velvet', name: 'Midnight Navy Velvet', price: 2000, color: '#1E3A8A', desc: 'Plush Velvet with Satin Interior' },
  { id: 'crimson-silk', name: 'Crimson Heritage Box', price: 2500, color: '#881337', desc: 'Monogrammed Crimson Velvet Box' }
];

const GIFT_CARD_AMOUNTS = [10000, 25000, 50000, 100000];

const GiftingSuite = () => {
  const [selectedBox, setSelectedBox] = useState(GIFT_BOXES[0]);
  const [giftNote, setGiftNote] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState(25000);

  const { success } = useToast();

  const handlePurchaseGiftCard = (e) => {
    e.preventDefault();
    success(`Luxury E-Gift Card for ₹${giftCardAmount.toLocaleString('en-IN')} successfully dispatched to ${recipientEmail}!`);
    setRecipientEmail('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Title */}
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <GlimmrLogo size="md" variant="dark" autoLoop={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#111111] uppercase tracking-wider">
            Luxury Gifting Suite & E-Gift Cards
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-xl mx-auto uppercase tracking-widest">
            Bespoke Velvet Packaging, Wax-Sealed Notes & Digital Luxury Gift Cards
          </p>
        </div>

        {/* Section 1: Velvet Packaging Selection */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-8 shadow-sm mb-12">
          <span className="font-mono text-[10px] text-[#B59A6C] font-bold uppercase tracking-widest block mb-2">
            ATELIER PACKAGING SELECTION
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#111111] uppercase mb-6">
            Signature Velvet Gift Boxes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GIFT_BOXES.map(box => (
              <button
                key={box.id}
                onClick={() => setSelectedBox(box)}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  selectedBox.id === box.id
                    ? 'border-[#B59A6C] bg-[#FAF9F7] shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 rounded-xl mb-4 shadow-sm" style={{ backgroundColor: box.color }} />
                <h3 className="font-bold text-base text-[#111111]">{box.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{box.desc}</p>
                <span className="font-mono text-sm font-bold text-[#B59A6C] mt-3 block">
                  + ₹{box.price.toLocaleString('en-IN')}
                </span>
              </button>
            ))}
          </div>

          {/* Personal Handwritten Note Input */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <label className="block text-xs font-mono font-bold uppercase text-gray-600 mb-2">
              Personal Wax-Sealed Gift Card Message:
            </label>
            <textarea
              rows={3}
              value={giftNote}
              onChange={e => setGiftNote(e.target.value)}
              placeholder="Write your heartfelt personalized note to be printed inside a wax-sealed envelope..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B59A6C] font-serif italic text-sm"
            />
          </div>
        </div>

        {/* Section 2: Instant E-Gift Cards */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-8 shadow-sm">
          <span className="font-mono text-[10px] text-[#B59A6C] font-bold uppercase tracking-widest block mb-2">
            INSTANT DIGITAL DISPATCH
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#111111] uppercase mb-6">
            Glimmr Luxury E-Gift Cards
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Live Gift Card Preview */}
            <div className="lg:col-span-5">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-tr from-[#111111] via-[#222222] to-[#333333] border-2 border-[#B59A6C] rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="font-heading text-xl font-bold tracking-widest text-[#B59A6C]">GLIMMR</span>
                  <span className="font-mono text-[10px] text-[#B59A6C] font-bold border border-[#B59A6C] px-2 py-0.5 rounded">
                    E-GIFT CARD
                  </span>
                </div>

                <div className="space-y-1 mb-8">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">GIFT VALUE</span>
                  <span className="font-mono text-3xl font-bold text-[#FAF9F7]">
                    ₹{giftCardAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-end text-xs font-mono text-gray-400 pt-4 border-t border-white/10">
                  <span>FOR: {recipientName || 'VALUED PATRON'}</span>
                  <span>FROM: {senderName || 'GLIMMR PATRON'}</span>
                </div>
              </motion.div>
            </div>

            {/* Gift Card Form */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-gray-600 mb-2">
                  Select Gift Card Balance:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GIFT_CARD_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setGiftCardAmount(amt)}
                      className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all ${
                        giftCardAmount === amt
                          ? 'border-[#B59A6C] bg-[#FAF9F7] text-[#B59A6C]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handlePurchaseGiftCard} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="Your Name (Sender)"
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B59A6C] text-sm"
                  />
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="Recipient's Name"
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B59A6C] text-sm"
                  />
                </div>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="Recipient's Email Address"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B59A6C] text-sm"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#B59A6C] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md hover:bg-[#9A7B4F] transition-colors"
                >
                  Purchase & Dispatch E-Gift Card • ₹{giftCardAmount.toLocaleString('en-IN')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftingSuite;
