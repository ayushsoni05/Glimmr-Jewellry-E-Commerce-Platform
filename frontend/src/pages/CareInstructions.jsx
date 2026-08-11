import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DiamondIcon, ShieldCheckIcon, CheckCircleIcon, AlertCircleIcon, SparklesIcon, OrderIcon } from '../components/Icons';

const CareInstructions = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const careCategories = [
    {
      id: 'gold',
      title: '22K & 24K Gold Jewelry',
      subtitle: 'Kundan, Polki & Pure Hallmarked Gold',
      tips: [
        'Clean gently using warm water and a mild non-chemical soap.',
        'Always dry thoroughly with a ultra-soft lint-free microfiber cloth.',
        'Store each piece in individual velvet-lined compartments to prevent gold scratching.',
        'Remove all gold pieces before entering swimming pools or thermal spas.',
        'Apply perfume, hairspray, and lotions prior to donning your gold jewelry.',
        'Schedule professional annual inspections for prong security.'
      ]
    },
    {
      id: 'diamonds',
      title: 'Certified Solitaires & Diamonds',
      subtitle: 'VVS/VS Brilliant Cut Gemstones',
      tips: [
        'Soak in warm soapy water for 15 minutes to dissolve oils and residue.',
        'Use a soft-bristled brush to gently clean around setting claws and pavilion bases.',
        'Rinse under tepid running water and pat dry with a soft cloth.',
        'Avoid touching solitaire stones directly with fingers to maintain maximum refraction.',
        'Store in dedicated soft pouches away from other gemstones.',
        'Annual professional ultrasonic cleaning and claw inspection.'
      ]
    },
    {
      id: 'silver',
      title: '925 Sterling & Oxidized Silver',
      subtitle: 'Heritage Hasli & Contemporary Cuffs',
      tips: [
        'Gently polish with a specialized silver polishing cloth to remove tarnish.',
        'Store in airtight anti-tarnish bags with silica gel pouches when not in use.',
        'Wear your silver frequently—body oils naturally help prevent rapid oxidation.',
        'Avoid exposure to household bleach, chlorine, and harsh cleaning agents.',
        'Keep oxidized silver pieces dry; do not scrub oxidized patina detailing.',
        'Store in cool, low-humidity environments.'
      ]
    },
    {
      id: 'watches',
      title: 'Swiss Horology & Timepieces',
      subtitle: 'Automatic & Quartz Fine Watches',
      tips: [
        'Wipe watch cases and sapphire crystals daily with a soft lint-free cloth.',
        'Ensure crowns are fully screwed down before any water exposure.',
        'Keep mechanical movements away from strong magnetic fields (speakers, laptops).',
        'Store leather strap timepieces in climate-controlled velvet boxes.',
        'Service mechanical movements every 3 to 5 years by certified watchmakers.',
        'Avoid thermal shocks like saunas or hot showers while wearing timepieces.'
      ]
    }
  ];

  const guidelines = [
    {
      title: 'What to Avoid',
      color: 'bg-[#FDF2F0] border-[#E8C8C1] text-rose-900',
      items: [
        'Chlorine & Swimming Pools (causes gold brittleness)',
        'Applying Fragrances & Perfumes Directly On Gems',
        'Abrasive Household Cleaners & Bleach',
        'Strenuous Sports & Weightlifting Wear',
        'Submerging Meenakari or Kundan in Boiling Water'
      ]
    },
    {
      title: 'Atelier Best Practices',
      color: 'bg-white border-[#E5E2D9] text-[#111111]',
      items: [
        'The Golden Rule: Put jewelry on LAST, take off FIRST',
        'Store Each Piece Separately in Velvet Compartments',
        'Close Necklaces & Bracelet Clasps Before Storing',
        'Wipe Down Moisture After High-Humidity Events',
        'Annual Professional Prong & Claws Audit'
      ]
    },
    {
      title: 'Preservation Storage',
      color: 'bg-[#FAF9F7] border-[#E5E2D9] text-[#111111]',
      items: [
        'Keep in Climate-Controlled, Low-Humidity Rooms',
        'Use Anti-Tarnish Strips for Sterling Silver',
        'Separate Hard Diamonds from Soft Pearls & Emeralds',
        'Keep Bridal Sets in Rigid Custom Box Sets',
        'Lay Long Chains Flat to Prevent Knotting'
      ]
    }
  ];

  const filteredCategories = activeCategory === 'all' 
    ? careCategories 
    : careCategories.filter(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Webflow Atelier Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[#E5E2D9] rounded-[28px] p-10 sm:p-14 shadow-[0_20px_50px_rgba(181,154,108,0.06)] relative overflow-hidden text-center"
        >
          {/* Animated Gold Backdrop Halo */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-[#B59A6C]/15 via-[#FDF2F0]/30 to-transparent rounded-full blur-3xl pointer-events-none"
          />

          <span className="inline-block px-4 py-1.5 bg-[#FDF2F0] border border-[#E8C8C1] text-[#B59A6C] font-mono text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-4 shadow-xs">
            ATELIER JEWELRY PRESERVATION &amp; CARE
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-[#111111] tracking-tight uppercase mb-4">
            Preserving Brilliance
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm font-body text-gray-600 leading-relaxed tracking-wider">
            Expert maintenance protocols for 22K/24K Kundan, certified solitaires, 925 sterling silver, and Swiss timepieces.
          </p>
        </motion.div>

        {/* Category Segmented Navigation Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white border border-[#E5E2D9] p-2 rounded-2xl md:rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.03)] grid grid-cols-2 md:grid-cols-5 gap-2"
        >
          {[
            { id: 'all', label: 'All Collections' },
            { id: 'gold', label: '22K/24K Gold' },
            { id: 'diamonds', label: 'Solitaires' },
            { id: 'silver', label: '925 Silver' },
            { id: 'watches', label: 'Swiss Watches' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative w-full py-3.5 px-3 font-body text-xs font-bold uppercase tracking-[0.15em] transition-colors rounded-xl md:rounded-full cursor-pointer z-10 text-center flex items-center justify-center ${
                  isActive ? 'text-[#FAF9F7]' : 'text-gray-500 hover:text-[#111111] hover:bg-[#FAF9F7]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCarePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 bg-[#111111] border border-[#B59A6C]/60 rounded-xl md:rounded-full shadow-md z-0"
                  />
                )}
                <span className="relative z-10 truncate">{cat.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Care Protocols Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {filteredCategories.map((c, idx) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white border border-[#E5E2D9] rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(0,0,0,0.03)] space-y-6 flex flex-col justify-between hover:border-[#B59A6C]/50 transition-all"
              >
                <div className="space-y-4">
                  <div className="border-b border-[#E5E2D9] pb-4">
                    <span className="text-[10px] font-mono text-[#B59A6C] font-bold uppercase tracking-[0.25em] block mb-1">
                      ATELIER MAINTENANCE PROTOCOL
                    </span>
                    <h2 className="text-2xl font-heading font-bold text-[#111111] uppercase tracking-wider">
                      {c.title}
                    </h2>
                    <p className="text-xs font-body text-gray-500">{c.subtitle}</p>
                  </div>

                  <ul className="space-y-3 pt-2">
                    {c.tips.map((tip, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-3 font-body text-xs text-gray-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C] mt-1.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">RECOMMENDED CYCLE: ANNUAL</span>
                  <span className="text-[10px] font-mono font-bold text-[#B59A6C] uppercase tracking-widest">BIS CERTIFIED</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* General Care Guidelines Grid (Dos & Don'ts Matrix) */}
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <span className="text-[10px] font-mono text-[#B59A6C] font-bold uppercase tracking-[0.25em] block mb-1">
              UNIVERSAL RULES OF ENGAGEMENT
            </span>
            <h2 className="text-3xl font-heading font-bold text-[#111111] uppercase tracking-wider">
              Essential Care Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guidelines.map((g, idx) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`border rounded-[24px] p-8 space-y-4 shadow-sm ${g.color}`}
              >
                <h3 className="font-heading font-bold text-lg uppercase tracking-wider border-b border-current/20 pb-3">
                  {g.title}
                </h3>
                <ul className="space-y-3">
                  {g.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-2.5 text-xs font-body leading-relaxed">
                      <span className="font-mono text-xs opacity-60">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Professional Atelier Service Concierge Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-[#E5E2D9] rounded-[28px] p-10 sm:p-12 text-center space-y-6 shadow-sm relative overflow-hidden"
        >
          <span className="inline-block px-4 py-1.5 bg-[#FAF9F7] border border-[#E5E2D9] text-[#B59A6C] font-mono text-[10px] font-bold uppercase tracking-[0.3em] rounded-full shadow-2xs">
            PATRON PRIVILEGE SERVICE
          </span>

          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#111111] uppercase tracking-wider">
            Complimentary Annual Atelier Service
          </h2>

          <p className="max-w-xl mx-auto text-xs sm:text-sm font-body text-gray-500 leading-relaxed">
            All Glimmr high jewelry creations include lifetime complimentary ultrasonic cleaning, prong security audits, and rhodium re-plating at any of our flagship boutiques.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 bg-[#111111] text-[#FAF9F7] border border-[#B59A6C]/40 text-xs font-mono font-bold uppercase tracking-[0.25em] hover:bg-[#B59A6C] hover:text-black transition-colors rounded-full cursor-pointer shadow-md"
              >
                SCHEDULE ATELIER SERVICE
              </motion.button>
            </Link>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 bg-[#FAF9F7] text-[#111111] border border-[#E5E2D9] text-xs font-mono font-bold uppercase tracking-[0.25em] hover:bg-white transition-colors rounded-full cursor-pointer shadow-xs"
              >
                BROWSE COLLECTIONS
              </motion.button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default CareInstructions;
