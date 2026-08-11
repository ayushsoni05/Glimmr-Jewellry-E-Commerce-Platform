import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FRAMER_IMAGES, FRAMER_PRODUCTS } from '../utils/framerAssets';

const Collections = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    {
      id: 'rings',
      title: 'Rings Collection',
      subtitle: 'SOLITAIRES & BANDS',
      description: 'Handcrafted engagement rings, stackable gold bands, and solitaire diamond rings.',
      image: FRAMER_PRODUCTS.find(p => p.id === 'vintage-cuff-bracelet')?.image || FRAMER_IMAGES.goldenMemory,
      itemCount: '14 Pieces',
      link: '/store-grid/rings',
      tag: 'POPULAR'
    },
    {
      id: 'necklaces',
      title: 'Necklaces Collection',
      subtitle: 'PENDANTS & CHAINS',
      description: 'Graceful gold chains, statement knot necklaces, and diamond pendant pieces.',
      image: FRAMER_PRODUCTS.find(p => p.id === 'real-knot-gold-necklace')?.image || FRAMER_IMAGES.hero,
      itemCount: '18 Pieces',
      link: '/store-grid/necklaces',
      tag: 'NEW'
    },
    {
      id: 'earrings',
      title: 'Earrings Collection',
      subtitle: 'STUDS & DROPS',
      description: 'Lustrous pearls, brilliant drop earrings, and minimal gold leaf hoops.',
      image: FRAMER_PRODUCTS.find(p => p.id === 'leaf-tears-earrings')?.image || FRAMER_IMAGES.hero2,
      itemCount: '12 Pieces',
      link: '/store-grid/earrings',
      tag: 'ESSENTIAL'
    },
    {
      id: 'bracelet',
      title: 'Bracelets Collection',
      subtitle: 'BANGLES & CHARMS',
      description: 'Delicate chain bracelets, solid guardian bangles, and pearl link cuffs.',
      image: FRAMER_PRODUCTS.find(p => p.id === 'guardian-bangle-bracelet')?.image || FRAMER_IMAGES.sparklePromo,
      itemCount: '15 Pieces',
      link: '/store-grid/bracelet',
      tag: 'FEATURED'
    },
    {
      id: 'watches',
      title: 'Timepieces Collection',
      subtitle: 'LUXURY WATCHES',
      description: 'Precision chronograph timepieces, classic steel chains, and gold watches.',
      image: FRAMER_PRODUCTS.find(p => p.id === 'femme-chronos-watch')?.image || FRAMER_IMAGES.minimalMe,
      itemCount: '8 Pieces',
      link: '/store-grid/watches',
      tag: 'EXCLUSIVE'
    },
    {
      id: 'minimal-me',
      title: 'Minimal Me Line',
      subtitle: 'EVERYDAY ELEGANCE',
      description: 'Understated luxury for everyday wear, light active jewelry for modern living.',
      image: FRAMER_IMAGES.minimalMeBanner,
      itemCount: '24 Pieces',
      link: '/store-grid',
      tag: 'LIMITED'
    }
  ];

  const filterTabs = [
    { id: 'all', label: 'ALL COLLECTIONS' },
    { id: 'rings', label: 'RINGS' },
    { id: 'necklaces', label: 'NECKLACES' },
    { id: 'earrings', label: 'EARRINGS' },
    { id: 'bracelet', label: 'BRACELETS' },
    { id: 'watches', label: 'WATCHES' }
  ];

  const filteredCategories = activeCategory === 'all'
    ? categories
    : categories.filter(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-white pb-24 font-body">
      {/* Hero Banner */}
      <div className="bg-[#FAF9F7] pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100 mb-12">
        <div className="max-w-[1520px] mx-auto text-center">
          {/* Breadcrumb */}
          <div className="text-xs font-body text-[#808080] mb-4 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Link to="/" className="hover:text-[#222222] transition-colors">Home</Link>
            <span className="text-gray-300">|</span>
            <span className="text-[#222222] font-semibold">Collections</span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#222222] font-normal tracking-tight mb-4"
          >
            Curated Collections
          </motion.h1>

          <p className="font-body text-[#808080] text-xs sm:text-sm tracking-wider uppercase max-w-xl mx-auto font-medium leading-relaxed">
            Explore our masterfully crafted fine jewelry, heirloom engagement rings, and luxury timepieces.
          </p>
        </div>
      </div>

      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto pb-6 mb-10 scrollbar-none border-b border-gray-100">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`relative px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-all whitespace-nowrap rounded-none cursor-pointer ${
                activeCategory === tab.id
                  ? 'text-[#222222]'
                  : 'text-[#808080] hover:text-[#222222]'
              }`}
            >
              {tab.label}
              {activeCategory === tab.id && (
                <motion.div
                  layoutId="categoryActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#222222]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Categories Cards Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((item, idx) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link to={item.link} className="block group">
                  <div className="relative aspect-[4/5] bg-[#FAF9F7] border border-[#EAE7E1] hover:border-[#222222] transition-all duration-500 overflow-hidden flex flex-col justify-between p-8 shadow-sm">
                    {/* Top Tag & Item Count Badge */}
                    <div className="relative z-10 flex justify-between items-center">
                      <span className="bg-white/90 backdrop-blur-sm border border-gray-200 text-[#222222] text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1">
                        {item.tag}
                      </span>
                      <span className="text-[#808080] text-[11px] font-mono tracking-widest uppercase font-semibold">
                        {item.itemCount}
                      </span>
                    </div>

                    {/* Center Image Container */}
                    <div className="absolute inset-0 flex items-center justify-center p-12 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain max-h-[260px] transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Gradient Overlay at Bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />

                    {/* Bottom Card Content */}
                    <div className="relative z-10 text-left mt-auto pt-16">
                      <span className="font-body text-[11px] font-semibold tracking-[0.25em] uppercase text-[#B59A6C] block mb-1">
                        {item.subtitle}
                      </span>
                      <h2 className="font-heading text-2xl lg:text-3xl text-[#222222] font-normal mb-2 tracking-tight">
                        {item.title}
                      </h2>
                      <p className="font-body text-[#666666] text-xs leading-relaxed mb-6 max-w-xs line-clamp-2">
                        {item.description}
                      </p>

                      <motion.div
                        whileHover={{ x: 4 }}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#222222] border-b border-[#222222] pb-1"
                      >
                        <span>EXPLORE COLLECTION</span>
                        <span>→</span>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Glimmr Promise Showcase Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 pt-16 border-t border-gray-100"
        >
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-body text-[11px] font-bold tracking-[0.3em] uppercase text-[#B59A6C] mb-2 block">
              HERITAGE & EXCELLENCE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl text-[#222222] font-normal tracking-tight uppercase">
              The Glimmr Guarantee
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-8 bg-[#FAF9F7] border border-gray-200/60 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#222222] text-white flex items-center justify-center mb-5 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-body text-base text-[#222222] font-bold uppercase tracking-wider mb-2">
                Certified Authenticity
              </h3>
              <p className="font-body text-[#777777] text-xs leading-relaxed max-w-xs">
                Every diamond and gold piece is individually hallmarked and accompanied by a official certificate of authenticity.
              </p>
            </div>

            <div className="p-8 bg-[#FAF9F7] border border-gray-200/60 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#222222] text-white flex items-center justify-center mb-5 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-body text-base text-[#222222] font-bold uppercase tracking-wider mb-2">
                Bespoke Design
              </h3>
              <p className="font-body text-[#777777] text-xs leading-relaxed max-w-xs">
                Handcrafted by master artisans combining traditional goldsmithing techniques with modern precision.
              </p>
            </div>

            <div className="p-8 bg-[#FAF9F7] border border-gray-200/60 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#222222] text-white flex items-center justify-center mb-5 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="font-body text-base text-[#222222] font-bold uppercase tracking-wider mb-2">
                Lifetime Service
              </h3>
              <p className="font-body text-[#777777] text-xs leading-relaxed max-w-xs">
                Enjoy complimentary professional cleaning, prong inspections, and polishing for the lifetime of your jewelry.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Collections;
