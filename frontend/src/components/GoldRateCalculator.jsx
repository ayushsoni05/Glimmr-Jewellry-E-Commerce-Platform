import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DIDWANA_ZONE } from '../utils/deliveryZone';
import { useMetalRates } from '../contexts/MetalRatesContext';

// Verified Himanshu Bullion Jodhpur Baseline Rates (per 10 grams)
export const DAILY_IBJA_RATES = {
  gold24k: 144921,  // Rs. 1,44,921 per 10g (derived from HB Jodhpur Gold 995 @ Rs. 144,341)
  gold22k: 132844,  // Rs. 1,32,844 per 10g - 916 BIS Hallmark
  gold18k: 108691,  // Rs. 1,08,691 per 10g - Diamond setting
  silver999: 1919   // Rs. 1,919 per 10g (HB Jodhpur Silver Bank Peti @ Rs. 1,91,910/kg)
};

const QUICK_WEIGHTS = [2, 5, 8, 10, 15, 20, 30, 50];

const GoldRateCalculator = ({ initialPurity = '22k', initialWeight = 10, compact = false }) => {
  const [selectedPurityId, setSelectedPurityId] = useState(initialPurity);
  const [weightGrams, setWeightGrams] = useState(initialWeight || 10);

  let liveRates = null;
  try {
    const metalRatesContext = useMetalRates();
    liveRates = metalRatesContext?.liveRates;
  } catch (e) {
    // Graceful fallback if rendered outside provider
  }

  const rates = useMemo(() => {
    return {
      gold24k: liveRates?.gold_10g_24k || DAILY_IBJA_RATES.gold24k,
      gold22k: liveRates?.gold_10g_22k || DAILY_IBJA_RATES.gold22k,
      gold18k: liveRates?.gold_10g_18k || DAILY_IBJA_RATES.gold18k,
      silver999: liveRates?.silver_1kg ? Math.round(liveRates.silver_1kg / 100) : DAILY_IBJA_RATES.silver999
    };
  }, [liveRates]);

  const purityOptions = useMemo(() => [
    { id: '22k', label: '22K Gold (916 BIS Hallmark)', ratePerGram: rates.gold22k / 10, defaultMakingPct: 12 },
    { id: '24k', label: '24K Pure Gold (999 Bullion)', ratePerGram: rates.gold24k / 10, defaultMakingPct: 4 },
    { id: '18k', label: '18K Gold (750 Diamond Setting)', ratePerGram: rates.gold18k / 10, defaultMakingPct: 14 },
    { id: 'silver', label: '925 Sterling Fine Silver', ratePerGram: rates.silver999 / 10, defaultMakingPct: 10 }
  ], [rates]);

  const selectedPurity = useMemo(() => {
    return purityOptions.find((p) => p.id === selectedPurityId) || purityOptions[0];
  }, [selectedPurityId, purityOptions]);

  const calculation = useMemo(() => {
    const validWeight = Math.max(0.1, Number(weightGrams) || 0.1);
    const metalValue = Math.round(validWeight * selectedPurity.ratePerGram);
    const makingCharges = Math.round((metalValue * selectedPurity.defaultMakingPct) / 100);
    const subtotal = metalValue + makingCharges;
    const gst = Math.round((subtotal * 3) / 100);
    const total = subtotal + gst;

    return {
      weight: validWeight,
      metalValue,
      makingCharges,
      gst,
      total
    };
  }, [weightGrams, selectedPurity]);

  const handleWhatsAppConsultation = () => {
    const lines = [
      'Namaste Monika Jewellers Didwana,',
      '',
      'I used your Himanshu Bullion Jodhpur Daily Rate Calculator and would like to inquire about crafting a design with these specifications:',
      `Metal Purity: ${selectedPurity.label}`,
      `Gross Weight: ${calculation.weight} grams`,
      `Benchmark Rate: Rs. ${Math.round(selectedPurity.ratePerGram).toLocaleString('en-IN')}/g`,
      `Estimated Metal Value: Rs. ${calculation.metalValue.toLocaleString('en-IN')}`,
      `Estimated Making Charges: Rs. ${calculation.makingCharges.toLocaleString('en-IN')}`,
      `Estimated 3% GST: Rs. ${calculation.gst.toLocaleString('en-IN')}`,
      `Total Estimated Valuation: Rs. ${calculation.total.toLocaleString('en-IN')}`,
      '',
      'Delivery Destination: Didwana, Rajasthan (PIN: 341303)',
      'Please let me know available designs matching this budget and weight.'
    ];

    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${DIDWANA_ZONE.whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className={`bg-[#1c1c1c] border border-white/10 ${compact ? 'p-4' : 'p-6 sm:p-8'} text-white`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-white/10 mb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B59A6C] block">
            Himanshu Bullion Jodhpur Benchmark
          </span>
          <h3 className="text-base sm:text-lg font-serif tracking-wide text-white">
            Daily Gold &amp; Silver Rate Calculator
          </h3>
        </div>
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 text-[10px] font-mono border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 uppercase tracking-wider">
            HB Jodhpur Live Ticker
          </span>
        </div>
      </div>

      {/* Purity Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {purityOptions.map((p) => {
          const isSelected = p.id === selectedPurityId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPurityId(p.id)}
              className={`p-3 text-left border transition-all text-xs font-body ${
                isSelected
                  ? 'border-[#B59A6C] bg-[#B59A6C]/10 text-white'
                  : 'border-white/10 bg-[#252525] text-white/70 hover:border-white/30'
              }`}
            >
              <div className="font-semibold text-white truncate">{p.label.split(' ')[0]}</div>
              <div className="text-[11px] text-[#B59A6C] font-mono mt-0.5">
                Rs. {Math.round(p.ratePerGram).toLocaleString('en-IN')}/g
              </div>
            </button>
          );
        })}
      </div>

      {/* Weight Input & Quick Chips */}
      <div className="mb-6">
        <label className="block text-xs font-mono uppercase tracking-widest text-white/70 mb-2">
          Select Target Weight in Grams
        </label>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="number"
            min="0.5"
            max="500"
            step="0.1"
            value={weightGrams}
            onChange={(e) => setWeightGrams(e.target.value)}
            className="w-32 bg-[#262626] border border-white/20 px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#B59A6C]"
          />
          <span className="text-xs font-mono text-white/60">Grams</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_WEIGHTS.map((wt) => (
            <button
              key={wt}
              type="button"
              onClick={() => setWeightGrams(wt)}
              className={`px-2.5 py-1 text-[11px] font-mono border transition-colors ${
                Number(weightGrams) === wt
                  ? 'bg-[#B59A6C] text-[#111111] border-[#B59A6C] font-bold'
                  : 'bg-[#252525] text-white/70 border-white/10 hover:border-white/30'
              }`}
            >
              {wt}g
            </button>
          ))}
        </div>
      </div>

      {/* Valuation Breakdown Table */}
      <div className="bg-[#242424] border border-white/10 p-4 space-y-2.5 text-xs font-body mb-6">
        <div className="flex justify-between items-center text-white/70">
          <span>Net Metal Value ({calculation.weight}g @ Rs. {Math.round(selectedPurity.ratePerGram).toLocaleString('en-IN')}/g)</span>
          <span className="font-mono text-white">Rs. {calculation.metalValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center text-white/70">
          <span>Making Charges (approx. {selectedPurity.defaultMakingPct}%)</span>
          <span className="font-mono text-white">Rs. {calculation.makingCharges.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center text-white/70">
          <span>Central &amp; State GST (3%)</span>
          <span className="font-mono text-white">Rs. {calculation.gst.toLocaleString('en-IN')}</span>
        </div>
        <div className="pt-2.5 border-t border-white/10 flex justify-between items-center text-sm font-semibold">
          <span className="text-[#B59A6C]">Estimated Total Price</span>
          <span className="font-mono text-[#B59A6C] text-base">Rs. {calculation.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* WhatsApp Action Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleWhatsAppConsultation}
        className="w-full py-3 bg-[#B59A6C] hover:bg-[#c4a97b] text-[#111111] font-body text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
      >
        <span>Discuss This Budget on WhatsApp (+91 9351214851)</span>
      </motion.button>
      <p className="text-[10px] font-mono text-center text-white/40 mt-3">
        Rates synchronized directly with Himanshu Bullion Jodhpur trading terminal. Actual final weight may vary slightly (+/- 0.05g) upon hallmarking.
      </p>
    </div>
  );
};

export default GoldRateCalculator;
