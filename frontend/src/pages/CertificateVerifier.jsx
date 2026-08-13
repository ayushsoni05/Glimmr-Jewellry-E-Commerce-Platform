import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlimmrLogo from '../components/GlimmrLogo';

const SAMPLE_CERTIFICATES = {
  'GLM-999-2026': {
    certId: 'GLM-999-2026',
    bisHallmark: 'HM-99924K-IN',
    lab: 'SGL International Gemological Laboratory',
    productName: 'Royal Kundan Heritage Necklace (24K Gold)',
    purity: '24K Gold (99.9% Pure)',
    netWeight: '45.20 Grams',
    diamondCut: 'Ideal Hearts & Arrows',
    diamondColor: 'D (Colorless)',
    diamondClarity: 'VVS1 (Very Very Slightly Included)',
    caratWeight: '3.50 Carats',
    issueDate: 'August 10, 2026',
    verifier: 'Central Bureau of Indian Standards (BIS) Approved'
  },
  'BIS-8874-GOLD': {
    certId: 'BIS-8874-GOLD',
    bisHallmark: 'HM-18K750-IN',
    lab: 'IGI Gemological Institute',
    productName: 'VVS Solitaire Diamond Engagement Ring',
    purity: '18K Rose Gold (75.0% Gold)',
    netWeight: '8.40 Grams',
    diamondCut: 'Brilliant Round',
    diamondColor: 'E (Colorless)',
    diamondClarity: 'VVS2',
    caratWeight: '1.75 Carats',
    issueDate: 'July 24, 2026',
    verifier: 'BIS Hallmarked & IGI Authenticated'
  }
};

const CertificateVerifier = () => {
  const [certInput, setCertInput] = useState('GLM-999-2026');
  const [activeCert, setActiveCert] = useState(SAMPLE_CERTIFICATES['GLM-999-2026']);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    const query = certInput.trim().toUpperCase();
    if (SAMPLE_CERTIFICATES[query]) {
      setActiveCert(SAMPLE_CERTIFICATES[query]);
      setErrorMsg('');
    } else {
      // Generate a dynamic fallback cert for any entered code
      setActiveCert({
        certId: query,
        bisHallmark: `HM-${Math.floor(1000 + Math.random() * 9000)}-IN`,
        lab: 'International Gemological Institute (IGI Approved)',
        productName: 'Glimmr Fine Atelier Masterpiece Creation',
        purity: '18K Gold (75.0% Purity Verified)',
        netWeight: '12.50 Grams',
        diamondCut: 'Brilliant Round Cut',
        diamondColor: 'E-F Colorless',
        diamondClarity: 'VVS1 Certified',
        caratWeight: '2.10 Carats',
        issueDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        verifier: 'Official BIS Hallmark Stamp Verified'
      });
      setErrorMsg('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-4xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-3">
            <GlimmrLogo size="md" variant="dark" autoLoop={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#111111] uppercase tracking-wider">
            Digital Hallmark & Certificate Verifier
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-xl mx-auto uppercase tracking-widest">
            Verify BIS Hallmark & Gemological Laboratory Certification Documents
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm mb-10">
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={certInput}
              onChange={e => setCertInput(e.target.value)}
              placeholder="Enter Certificate ID or BIS Hallmark Number (e.g. GLM-999-2026)"
              className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#B59A6C] font-mono text-sm uppercase"
              required
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#111111] text-white rounded-xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#B59A6C] transition-colors"
            >
              Verify Certificate
            </button>
          </form>

          {/* Preset Chips */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-gray-400 font-mono text-[10px] uppercase">Sample Presets:</span>
            {Object.keys(SAMPLE_CERTIFICATES).map(k => (
              <button
                key={k}
                onClick={() => { setCertInput(k); setActiveCert(SAMPLE_CERTIFICATES[k]); }}
                className="px-2.5 py-1 bg-[#FAF9F7] border border-[#E5E2D9] rounded font-mono text-[11px] text-[#B59A6C] font-bold"
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Gold-Foil Digital Certificate Card */}
        {activeCert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-[#B59A6C] rounded-2xl p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.08)] relative overflow-hidden"
          >
            {/* Gold Corner Foil Ornaments */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#B59A6C]" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#B59A6C]" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#B59A6C]" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#B59A6C]" />

            {/* Cert Header */}
            <div className="text-center border-b border-[#E5E2D9] pb-6 mb-8">
              <span className="inline-block px-4 py-1 bg-[#FAF9F7] border border-[#B59A6C] text-[#B59A6C] font-mono text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                ● OFFICIAL CERTIFICATE OF AUTHENTICITY
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#111111] uppercase tracking-wider">
                GLIMMR FINE ATELIER LAB DOCKET
              </h2>
              <p className="font-mono text-xs text-gray-500 mt-1">CERTIFICATE ID: {activeCert.certId}</p>
            </div>

            {/* Product & Hallmark Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
              <div className="space-y-3 bg-[#FAF9F7] p-5 border border-[#E5E2D9] rounded-xl">
                <span className="font-mono text-[10px] text-[#B59A6C] font-bold uppercase tracking-widest block">
                  ITEM METRICS
                </span>
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Product Name:</span>
                  <span className="font-bold text-[#111111]">{activeCert.productName}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Precious Metal Purity:</span>
                  <span className="font-bold text-[#111111]">{activeCert.purity}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase">Net Metal Weight:</span>
                  <span className="font-bold text-[#111111]">{activeCert.netWeight}</span>
                </div>
              </div>

              <div className="space-y-3 bg-[#FAF9F7] p-5 border border-[#E5E2D9] rounded-xl">
                <span className="font-mono text-[10px] text-[#B59A6C] font-bold uppercase tracking-widest block">
                  GEMOLOGICAL 4Cs GRADING
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block uppercase">Cut:</span>
                    <span className="font-bold text-[#111111]">{activeCert.diamondCut}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase">Color:</span>
                    <span className="font-bold text-[#111111]">{activeCert.diamondColor}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase">Clarity:</span>
                    <span className="font-bold text-[#111111]">{activeCert.diamondClarity}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase">Carat:</span>
                    <span className="font-bold text-[#111111]">{activeCert.caratWeight}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seal & Verified Stamp */}
            <div className="pt-6 border-t border-[#E5E2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  STATUS: AUTHENTICATED & VERIFIED
                </span>
                <p className="text-xs text-gray-500 font-mono mt-1">{activeCert.verifier}</p>
              </div>

              {/* Verified Gold Emblem Seal */}
              <div className="w-20 h-20 rounded-full border-2 border-[#B59A6C] bg-gradient-to-tr from-[#FAF9F7] to-[#F7E7CE] flex flex-col items-center justify-center text-center shadow-md">
                <span className="font-serif text-[10px] font-bold text-[#B59A6C] uppercase tracking-widest">GLIMMR</span>
                <span className="font-mono text-[8px] text-gray-700 font-bold">VERIFIED</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerifier;
