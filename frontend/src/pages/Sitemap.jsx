import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SparkleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.7 + 0.2,
        alphaSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += p.alphaSpeed;

        if (p.alpha > 0.85 || p.alpha < 0.15) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(181, 154, 108, ${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#B59A6C';
        ctx.fill();
        ctx.restore();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-75" />;
};

const Sitemap = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const sitemapCategories = [
    {
      id: 'collections',
      num: '01',
      code: 'HJ-COLLECTIONS',
      category: 'Haute Joaillerie Collections',
      badge: 'Heritage & Legacy',
      heroImage: 'https://framerusercontent.com/images/kbOrsOMF8pMkMH6SntJTPO88bQ.png',
      links: [
        { 
          title: 'Gold Kundan Royal Heritage', 
          path: '/collections', 
          desc: 'Handcrafted 24K Kundan bridal & festive jewelry.', 
          meta: '24K Kundan Gold',
          image: 'https://framerusercontent.com/images/kbOrsOMF8pMkMH6SntJTPO88bQ.png' 
        },
        { 
          title: '925 Fine Sterling Silver Hasli', 
          path: '/collections', 
          desc: 'Artisanal oxidized and polished silver neckwear.', 
          meta: '925 Fine Silver',
          image: 'https://framerusercontent.com/images/lwWSRpm9ihnLqpWiEKW3NXpyJU.png' 
        },
        { 
          title: 'Vintage Timepieces Portfolio', 
          path: '/store-grid/watches', 
          desc: 'Certified luxury chronographs & gold wristwatches.', 
          meta: 'Swiss Movement',
          image: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png?width=800' 
        },
        { 
          title: 'Haute Diamond Signature Sets', 
          path: '/collections', 
          desc: 'Solitaire rings & certified brilliant diamond necklaces.', 
          meta: 'VVS Solitaires',
          image: 'https://framerusercontent.com/images/ye7CD1FwMK23YrmwGKBxPmwkxs.png?width=800' 
        }
      ]
    },
    {
      id: 'categories',
      num: '02',
      code: 'FJ-CATEGORIES',
      category: 'Fine Jewelry Categories',
      badge: 'Certified Fine Pieces',
      heroImage: 'https://framerusercontent.com/images/VUCxKLRtAXtB7J9fhWKrMpxLg.png?width=800',
      links: [
        { 
          title: 'Necklaces & Hasli', 
          path: '/store-grid/necklace', 
          desc: 'Kundan chokers, silver chains & statement neckpieces.', 
          meta: 'Fine Neckwear',
          image: 'https://framerusercontent.com/images/ye7CD1FwMK23YrmwGKBxPmwkxs.png?width=800' 
        },
        { 
          title: 'Rings & Solitaires', 
          path: '/store-grid/rings', 
          desc: 'Engagement rings, gold bands & gemstone statement rings.', 
          meta: 'Bespoke Sizing',
          image: 'https://framerusercontent.com/images/nYmBPU9wzxN2XzOy4Mors5JiA.png?width=800' 
        },
        { 
          title: 'Earrings & Jhumkas', 
          path: '/store-grid/earring', 
          desc: 'Royal drops, studs, chandeliers & traditional hoops.', 
          meta: 'Gold & Silver',
          image: 'https://framerusercontent.com/images/VUCxKLRtAXtB7J9fhWKrMpxLg.png?width=800' 
        },
        { 
          title: 'Bracelets & Cuffs', 
          path: '/store-grid/bracelet', 
          desc: 'Artisanal bangles, solid silver cuffs & gold tennis chains.', 
          meta: 'Artisanal Bangles',
          image: 'https://framerusercontent.com/images/DdMSTOefO0YEho190OisMkszb8.png?width=800' 
        },
        { 
          title: 'Precious Timepieces', 
          path: '/store-grid/watches', 
          desc: 'Swiss-movement luxury watches & gold straps.', 
          meta: 'Luxury Chronos',
          image: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png?width=800' 
        },
        { 
          title: "Men's Atelier Collection", 
          path: '/store-grid', 
          desc: 'Signet rings, cufflinks & solid silver kadas.', 
          meta: "Men's Vault",
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=90' 
        }
      ]
    },
    {
      id: 'client-care',
      num: '03',
      code: 'CC-CARE',
      category: 'White-Glove Client Care',
      badge: 'White-Glove Atelier',
      heroImage: 'https://framerusercontent.com/images/nYmBPU9wzxN2XzOy4Mors5JiA.png?width=800',
      links: [
        { 
          title: 'Bespoke Size Guide', 
          path: '/size-guide', 
          desc: 'Universal ring sizing & necklace length recommendations.', 
          meta: 'Ring & Chain Chart',
          image: 'https://framerusercontent.com/images/kbOrsOMF8pMkMH6SntJTPO88bQ.png' 
        },
        { 
          title: 'Care & Preservation Instructions', 
          path: '/care-instructions', 
          desc: 'Professional cleaning & gold/silver preservation guides.', 
          meta: 'Preservation Tips',
          image: 'https://framerusercontent.com/images/lwWSRpm9ihnLqpWiEKW3NXpyJU.png' 
        },
        { 
          title: 'Contact Concierge Desk', 
          path: '/contact', 
          desc: 'Private consultations & 24/7 client care assistance.', 
          meta: '24/7 Concierge',
          image: 'https://framerusercontent.com/images/nYmBPU9wzxN2XzOy4Mors5JiA.png' 
        },
        { 
          title: 'About Glimmr Atelier', 
          path: '/about', 
          desc: 'Our legacy, master craftsmen, and BIS hallmarking heritage.', 
          meta: 'Atelier Heritage',
          image: 'https://framerusercontent.com/images/DdMSTOefO0YEho190OisMkszb8.png' 
        },
        { 
          title: 'Live Gold & Silver Metal Rates', 
          path: '/live-rates', 
          desc: 'Real-time market valuation for 24K, 22K, 18K & 925 Silver.', 
          meta: 'Live Market Ticker',
          image: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png' 
        }
      ]
    },
    {
      id: 'account',
      num: '04',
      code: 'PA-PORTFOLIO',
      category: 'Client Account & Portfolio',
      badge: 'Personal Dashboard',
      heroImage: 'https://framerusercontent.com/images/ye7CD1FwMK23YrmwGKBxPmwkxs.png?width=800',
      links: [
        { 
          title: 'Patron Account Dashboard', 
          path: '/profile', 
          desc: 'Manage saved addresses, loyalty points & profile credentials.', 
          meta: 'Client Dashboard',
          image: 'https://framerusercontent.com/images/VUCxKLRtAXtB7J9fhWKrMpxLg.png' 
        },
        { 
          title: 'Acquired Order History', 
          path: '/profile?tab=orders', 
          desc: 'Track shipments & view historical order valuations.', 
          meta: 'GST Tax Invoices',
          image: 'https://framerusercontent.com/images/kbOrsOMF8pMkMH6SntJTPO88bQ.png' 
        },
        { 
          title: 'Saved Wishlist Portfolio', 
          path: '/wishlist', 
          desc: 'Curated personal vault of favorite jewelry pieces.', 
          meta: 'Personal Vault',
          image: 'https://framerusercontent.com/images/ye7CD1FwMK23YrmwGKBxPmwkxs.png' 
        },
        { 
          title: 'Shopping Bag & Checkout', 
          path: '/cart', 
          desc: 'Review selected pieces & proceed to SSL-secured checkout.', 
          meta: '256-bit SSL',
          image: 'https://framerusercontent.com/images/DdMSTOefO0YEho190OisMkszb8.png' 
        },
        { 
          title: 'Personalized Recommender Engine', 
          path: '/recommender', 
          desc: 'AI-assisted fine jewelry style matching.', 
          meta: 'AI Style Match',
          image: 'https://framerusercontent.com/images/nYmBPU9wzxN2XzOy4Mors5JiA.png' 
        }
      ]
    },
    {
      id: 'legal',
      num: '05',
      code: 'TS-GOVERNANCE',
      category: 'Trust, Security & Compliance',
      badge: 'DPDP & BIS Guarantee',
      heroImage: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png?width=800',
      links: [
        { 
          title: 'Privacy Policy & Trust Guarantee', 
          path: '/privacy-policy', 
          desc: 'Client data protection rights, 256-bit SSL & DPO contacts.', 
          meta: 'DPDP Act 2023',
          image: 'https://framerusercontent.com/images/lwWSRpm9ihnLqpWiEKW3NXpyJU.png' 
        },
        { 
          title: 'Terms & Conditions', 
          path: '/terms-and-conditions', 
          desc: 'Official Atelier purchasing terms & GST invoice conditions.', 
          meta: 'Purchasing Terms',
          image: 'https://framerusercontent.com/images/kbOrsOMF8pMkMH6SntJTPO88bQ.png' 
        },
        { 
          title: 'Digital Business Credentials', 
          path: '/business-card', 
          desc: 'Certified store locations & direct executive credentials.', 
          meta: 'Store Directory',
          image: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png' 
        }
      ]
    }
  ];

  // Total count of all pages
  const totalPageCount = sitemapCategories.reduce((sum, c) => sum + c.links.length, 0);

  // Filter links based on category filter tab & live search query
  const filteredData = sitemapCategories
    .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
    .map(cat => {
      const matchingLinks = cat.links.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.meta.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...cat, links: matchingLinks };
    })
    .filter(cat => cat.links.length > 0);

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] font-body selection:bg-[#B59A6C]/20">
      
      {/* Webflow Architectural Hero Banner with WebGL Canvas Sparkle */}
      <section className="relative bg-[#FAF9F7] text-[#222222] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-gray-100">
        <SparkleCanvas />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          
          {/* Webflow Top Tag Badge with Gold Pulse Halo Dot */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2 bg-white border border-[#E5E2D9] shadow-sm mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B59A6C] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B59A6C]" />
            </span>
            <span className="font-heading font-bold text-xs uppercase tracking-[0.25em] text-[#222222]">
              VISUAL DIRECTORY • {totalPageCount} FINE PAGES
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-3xl sm:text-5xl lg:text-6xl text-[#222222] uppercase tracking-[0.2em] font-normal leading-tight max-w-5xl mx-auto mb-4"
          >
            ATELIER SITEMAP
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-[#808080] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Visual showcase directory of all Glimmr Atelier fine jewelry collections, bespoke services, client care guidelines, and compliance documentation.
          </motion.p>

          {/* Webflow Minimalist Architectural Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 max-w-xl mx-auto relative"
          >
            <div className="relative flex items-center">
              <span className="absolute left-4 font-mono text-[11px] text-[#B59A6C] font-bold uppercase tracking-widest">
                SEARCH //
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to filter collections, services, or legal pages..."
                className="w-full pl-24 pr-10 py-4 bg-white border border-[#E5E2D9] text-[#222222] placeholder-gray-400 text-xs font-body focus:outline-none focus:border-[#B59A6C] shadow-sm transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-mono text-gray-400 hover:text-[#222222]"
                >
                  CLEAR
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Framer Motion Sliding Tab Bar (Smooth Layout Animation) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E2D9] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5 relative">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`relative px-4 py-2 text-xs font-body uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap z-10 ${
                selectedCategory === 'all'
                  ? 'text-white font-bold'
                  : 'text-[#808080] hover:text-[#222222]'
              }`}
            >
              {selectedCategory === 'all' && (
                <motion.div 
                  layoutId="tabBackground"
                  className="absolute inset-0 bg-[#222222] -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              ALL SECTIONS ({totalPageCount})
            </button>

            {sitemapCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative px-4 py-2 text-xs font-body uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap z-10 flex items-center gap-2 ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-[#808080] hover:text-[#222222]'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="tabBackground"
                      className="absolute inset-0 bg-[#222222] -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="font-mono text-[#B59A6C] text-[10px] font-bold">[{cat.num}]</span>
                  <span>{cat.category} ({cat.links.length})</span>
                </button>
              );
            })}
          </div>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-[11px] font-mono text-[#B59A6C] hover:underline uppercase tracking-widest cursor-pointer whitespace-nowrap shrink-0 ml-4 font-bold"
            >
              RESET FILTERS
            </button>
          )}
        </div>
      </div>

      {/* Main Sitemap Visual Directory Showcases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {filteredData.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white border border-[#E5E2D9] p-8 max-w-md mx-auto"
          >
            <p className="text-sm font-body text-gray-500 mb-4">No matching pages found for "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-6 py-2.5 bg-[#222222] text-white text-xs font-body font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer"
            >
              Reset Search Filter
            </button>
          </motion.div>
        ) : (
          filteredData.map((section, sIdx) => {
            return (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: sIdx * 0.08 }}
                className="space-y-8"
              >
                {/* Architectural Category Header with Chapter Code Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#222222] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {section.num}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-[#B59A6C] uppercase tracking-widest font-semibold">
                          INDEX {section.num} • {section.code}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#B59A6C]" />
                        <span className="px-2 py-0.5 bg-[#FDF2F0] border border-[#E8C8C1] text-[#B59A6C] text-[9px] font-body font-bold uppercase tracking-widest">
                          {section.badge}
                        </span>
                      </div>
                      <h2 className="font-heading font-extrabold text-2xl text-[#222222] uppercase tracking-wide">
                        {section.category}
                      </h2>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-gray-400">
                    {section.links.length} DIRECTORY ROUTES AVAILABLE
                  </span>
                </div>

                {/* Framer Motion Visual Image-Cover Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence>
                    {section.links.map((link, idx) => (
                      <motion.div
                        key={link.title}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -8, borderColor: '#B59A6C' }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                        className="bg-white border border-[#E5E2D9] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between group cursor-pointer relative"
                      >
                        {/* High-Resolution Visual Image Cover with Framer Zoom Effect */}
                        <div className="relative h-44 bg-[#FAF9F7] overflow-hidden border-b border-gray-100">
                          <img 
                            src={link.image} 
                            alt={link.title} 
                            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          
                          {/* Top-Right Chapter Stamp Badge */}
                          <span className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md text-white font-mono text-[9px] uppercase tracking-widest font-bold border border-white/20">
                            SEC {section.num} • 0{idx + 1}
                          </span>

                          {/* Overlay Title on Image */}
                          <div className="absolute bottom-3 left-4 right-4 text-white">
                            <span className="inline-block px-2 py-0.5 bg-[#B59A6C] text-white font-mono text-[9px] uppercase tracking-widest font-bold mb-1">
                              {link.meta}
                            </span>
                            <h3 className="font-heading font-bold text-base text-white leading-tight uppercase tracking-wider">
                              {link.title}
                            </h3>
                          </div>
                        </div>

                        {/* Card Content & Action Link */}
                        <div className="p-6 flex flex-col justify-between flex-grow">
                          <p className="text-xs font-body text-[#808080] leading-relaxed mb-6">
                            {link.desc}
                          </p>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px]">
                            <span className="font-mono text-gray-400 uppercase text-[10px]">ROUTE: {link.path}</span>
                            <Link 
                              to={link.path}
                              className="font-body font-bold text-[#B59A6C] group-hover:underline uppercase tracking-widest flex items-center gap-1.5"
                            >
                              <span>EXPLORE PAGE</span>
                              <span className="text-xs">→</span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}
      </section>

      {/* Webflow Dark CTA Footer */}
      <section className="bg-[#222222] py-20 text-[#FAF9F7] text-center border-t border-[#B59A6C]/20">
        <div className="max-w-2xl mx-auto px-4">
          <span className="text-xs font-body font-semibold uppercase tracking-[0.3em] text-[#B59A6C] block mb-2">
            ATELIER DIRECTORY CONCIERGE
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white mb-4">
            Need Personal Guidance?
          </h3>
          <p className="text-xs font-body text-gray-300 mb-6 leading-relaxed">
            Our white-glove concierges are available 24/7 to assist with ring sizing, custom Kundan orders, and gold rate consultations.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3.5 bg-[#FAF9F7] text-[#222222] text-xs font-body font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] hover:text-white transition-colors"
          >
            Contact Atelier Concierge
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Sitemap;
