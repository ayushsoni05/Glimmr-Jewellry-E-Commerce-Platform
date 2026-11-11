import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIDWANA_ZONE } from '../utils/deliveryZone';
import { STORE_CONFIG } from '../config/storeConfig';

const ShopLocationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full max-w-2xl bg-white border border-[#E5E2D9] shadow-2xl rounded-none my-auto overflow-hidden z-10"
        >
          {/* Top Gold Accent Bar */}
          <div className="h-1 bg-[#B59A6C] w-full" />

          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-[#FAF9F7]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B59A6C] font-bold">
                  FLAGSHIP SHOWROOM &amp; ATELIER
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#111111] mt-1 tracking-wide">
                {STORE_CONFIG.name.toUpperCase()} - DIDWANA
              </h2>
              <p className="text-xs font-body text-gray-500 mt-0.5">
                Didwana, Rajasthan - PIN 341303, India
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-[#111111] transition-colors rounded hover:bg-gray-200/50 cursor-pointer"
              aria-label="Close location modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* High Precision Map Embed */}
            <div className="relative w-full h-64 sm:h-72 border border-gray-200 bg-gray-50 overflow-hidden">
              <iframe
                title="Monika Jewellers Didwana Showroom Map"
                src={DIDWANA_ZONE.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 border border-gray-200 shadow-xs text-[10px] font-mono text-[#111111] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" />
                <span>GPS: 27.3995 N, 74.5762 E</span>
              </div>
            </div>

            {/* Store Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              <div className="p-3.5 bg-[#FAF9F7] border border-[#E5E2D9] space-y-1.5">
                <span className="text-[10px] font-mono text-[#B59A6C] font-bold uppercase tracking-wider block">
                  SHOWROOM ADDRESS
                </span>
                <p className="font-bold text-[#111111] text-sm">
                  Monika Jewellers
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Didwana, Rajasthan - 341303<br />
                  District: Didwana-Kuchaman (Nagaur region)
                </p>
                <div className="pt-1 text-[11px] text-gray-500 font-mono">
                  Phone: <a href="tel:9351214851" className="text-[#111111] font-bold hover:underline">+91 9351214851</a>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F7] border border-[#E5E2D9] space-y-1.5">
                <span className="text-[10px] font-mono text-[#B59A6C] font-bold uppercase tracking-wider block">
                  SHOWROOM TIMINGS
                </span>
                <p className="text-gray-700">
                  <strong className="text-[#111111]">Mon - Sat:</strong> 10:00 AM - 8:30 PM IST
                </p>
                <p className="text-gray-700">
                  <strong className="text-[#111111]">Sunday:</strong> 11:00 AM - 6:00 PM IST
                </p>
                <div className="pt-1.5">
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                    Open Today - Walk-in &amp; Appointments Welcome
                  </span>
                </div>
              </div>
            </div>

            {/* Strict Delivery Zone Notice */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 text-xs font-body space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold uppercase text-[11px] tracking-wider">
                <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Delivery Policy Notice</span>
              </div>
              <p className="text-amber-900 leading-relaxed text-[11px]">
                Online doorstep delivery is available exclusively within <strong>Didwana, Rajasthan (PIN: 341303)</strong>.
                If you are located outside Didwana, please discuss with us directly on WhatsApp to coordinate special insured courier delivery.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <a
                href={DIDWANA_ZONE.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 bg-[#111111] hover:bg-[#222222] text-white text-xs font-body font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-[#B59A6C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Get Directions (Google Maps)</span>
              </a>

              <a
                href={DIDWANA_ZONE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-body font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShopLocationModal;
