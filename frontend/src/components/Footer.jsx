import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STORE_CONFIG } from '../config/storeConfig';
import { DIDWANA_ZONE, DIDWANA_LANDMARKS, getShowroomLiveStatus } from '../utils/deliveryZone';

const FOOTER_TABS = [
  { id: 'map', label: 'Interactive Showroom Map' },
  { id: 'landmarks', label: 'Didwana Landmark Guide' },
  { id: 'delivery', label: 'Hyperlocal Delivery (PIN 341303)' }
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('map');

  const showroomStatus = useMemo(() => {
    return getShowroomLiveStatus();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-[#1b1b1b] text-white pt-12 sm:pt-16 pb-12 sm:pb-16 border-t border-white/10">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* =========================================================================
            DIDWANA SHOWROOM & HYPERLOCAL MAP SHOWCASE
           ========================================================================= */}
        <div className="mb-14 sm:mb-20 bg-[#222222] border border-white/15 p-5 sm:p-8">
          
          {/* Header Row: Title & Live IST Operating Status */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B59A6C]">
                  Flagship Destination
                </span>
                <span className="text-white/30">•</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                  Rajasthan PIN 341303
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-serif tracking-wide text-white">
                Monika Jewellers Showroom &amp; Didwana Atelier
              </h3>
              <p className="text-xs font-body text-white/60 mt-1">
                Main Bazaar, Didwana, Rajasthan (PIN: 341303) • Central Landmark Destination
              </p>
            </div>

            {/* Live IST Status Pill */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className={`px-3 py-1.5 border text-xs font-mono uppercase tracking-wider flex items-center gap-2 ${
                showroomStatus.isOpen
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400'
                  : 'border-amber-500/50 bg-amber-950/40 text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  showroomStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <span>[{showroomStatus.badgeText}]</span>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs font-body text-white font-medium">
                  {showroomStatus.statusText}
                </div>
                <div className="text-[10px] font-mono text-white/50">
                  {showroomStatus.schedule}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 pt-4 pb-4">
            {FOOTER_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-body tracking-wider uppercase transition-all border ${
                    isSelected
                      ? 'border-[#B59A6C] bg-[#B59A6C] text-[#111111] font-bold'
                      : 'border-white/10 bg-[#191919] text-white/70 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: INTERACTIVE GOOGLE MAP */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="relative w-full h-72 sm:h-96 border border-white/10 overflow-hidden bg-black">
                <iframe
                  title="Monika Jewellers Showroom Didwana"
                  src={DIDWANA_ZONE.mapsEmbedUrl}
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Map Info Strip */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#181818] p-3.5 border border-white/10 text-xs font-mono">
                <div className="text-white/70">
                  GPS Coordinates: <span className="text-[#B59A6C] font-bold">27.3995 N, 74.5762 E</span> • Precision Geofenced Didwana Showroom
                </div>
                <div className="text-white/50 text-[11px]">
                  PIN 341303 • Nagaur / Didwana-Kuchaman District
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIDWANA LANDMARK & TRANSIT GUIDE */}
          {activeTab === 'landmarks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DIDWANA_LANDMARKS.map((item) => (
                <div key={item.name} className="p-4 bg-[#191919] border border-white/10 text-xs space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-white font-body">{item.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#B59A6C]/10 text-[#B59A6C] border border-[#B59A6C]/30 flex-shrink-0">
                      {item.approxTime}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#B59A6C]">{item.distance} from Showroom</p>
                  <p className="text-white/60 text-[11px] leading-relaxed pt-1">{item.description}</p>
                </div>
              ))}
              <div className="p-4 bg-[#1e1e1e] border border-[#B59A6C]/30 text-xs space-y-1">
                <h4 className="font-semibold text-[#B59A6C] font-body">Patron Parking &amp; Accessibility</h4>
                <p className="text-white/70 text-[11px] leading-relaxed">
                  Dedicated family four-wheeler parking near Main Bazaar entry with private valet assistance upon calling ahead.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: HYPERLOCAL DELIVERY POLICY */}
          {activeTab === 'delivery' && (
            <div className="p-5 sm:p-6 bg-[#191919] border border-white/10 space-y-4 text-xs font-body">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#B59A6C] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-[#B59A6C] text-sm mb-1 uppercase tracking-wider">
                    Strict Hyperlocal Delivery Policy (Didwana PIN: 341303 Only)
                  </h4>
                  <p className="text-white/80 leading-relaxed">
                    Online doorstep delivery is available <span className="font-bold text-white underline">exclusively within Didwana, Rajasthan (PIN: 341303)</span>.
                    Every local order is personally transported by bonded Monika Jewellers showroom staff in tamper-evident sealed luxury packaging, accompanied by the official BIS 916 Hallmark certificate card.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#232323] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[#B59A6C] font-mono font-bold text-sm">PIN 341303</div>
                  <div className="text-white/60 text-[11px]">Free Local Doorstep Delivery</div>
                </div>
                <div>
                  <div className="text-[#B59A6C] font-mono font-bold text-sm">100% Sealed</div>
                  <div className="text-white/60 text-[11px]">Bonded Staff Handover</div>
                </div>
                <div>
                  <div className="text-[#B59A6C] font-mono font-bold text-sm">Outside Didwana?</div>
                  <div className="text-white/60 text-[11px]">Special WhatsApp Request</div>
                </div>
              </div>

              <p className="text-white/60 text-[11px]">
                Patrons outside Didwana wishing to acquire bridal jewellery or high-value pieces can connect directly with our directors on WhatsApp to explore custom insured courier transit options.
              </p>
            </div>
          )}

          {/* Quick Action Buttons Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-white/10">
            <a
              href={DIDWANA_ZONE.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-[#B59A6C] hover:bg-[#c4a97b] text-[#111111] font-body text-xs font-bold uppercase tracking-[0.15em] text-center transition-all"
            >
              Get Driving Directions
            </a>
            <a
              href={`tel:${DIDWANA_ZONE.whatsappNumber}`}
              className="py-3 px-4 bg-[#262626] hover:bg-[#333333] border border-white/20 text-white font-body text-xs font-bold uppercase tracking-[0.15em] text-center transition-all"
            >
              Call Showroom (+91 9351214851)
            </a>
            <a
              href={DIDWANA_ZONE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-black font-body text-xs font-bold uppercase tracking-[0.15em] text-center transition-all"
            >
              Message on WhatsApp
            </a>
          </div>

        </div>

        {/* =========================================================================
            STANDARD NAVIGATION COLUMNS
           ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 mb-12 sm:mb-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1"
          >
            <Link to="/" className="inline-block mb-4">
              <img src="/logo-mj-horizontal.png" alt="Monika Jewellers" className="h-12 sm:h-14 w-auto object-contain brightness-110" />
            </Link>
            <p className="text-white/60 font-body text-xs max-w-xs mb-6 leading-relaxed">
              Carrying forward the sacred heritage of Indian fine jewellery. Every creation is 100% BIS 916 hallmarked, adorned with certified natural gemstones, and handcrafted for your family's enduring milestones.
            </p>
            {/* Newsletter Section */}
            <form onSubmit={handleSubscribe} className="flex border-b border-white/20 pb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email for shagun offers"
                required
                className="bg-transparent border-none focus:outline-none text-white placeholder-white/40 flex-1 font-body text-xs"
              />
              <button
                type="submit"
                className="text-[#B59A6C] hover:text-white font-body text-xs tracking-widest uppercase transition-colors font-semibold"
              >
                {subscribed ? 'Subscribed' : 'Join Privé'}
              </button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-xs font-semibold text-[#B59A6C] tracking-[0.2em] uppercase mb-4">Collections</h4>
            <ul className="space-y-3">
              <li><Link to="/store-grid/rings" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Sagai &amp; Solitaire Rings</Link></li>
              <li><Link to="/store-grid/necklace" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Rani Haar &amp; Mangalsutras</Link></li>
              <li><Link to="/store-grid/earring" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Jhumkas &amp; Chandbalis</Link></li>
              <li><Link to="/store-grid/bracelet" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Nakshi &amp; Kada Bangles</Link></li>
              <li><Link to="/collections" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Vivaha Bridal Trousseau</Link></li>
              <li><Link to="/live-rates" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">24K Laxmi Gold Coins</Link></li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <h4 className="text-xs font-semibold text-[#B59A6C] tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              Patron Services
            </h4>
            <ul className="space-y-3">
              <li><Link to="/size-guide" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Indian Ring &amp; Bangle Sizer</Link></li>
              <li><Link to="/care-instructions" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Jewelry Care &amp; Storage</Link></li>
              <li><Link to="/live-rates" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Daily IBJA Bullion Ticker</Link></li>
              <li><Link to="/verify-certificate" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">HUID Hallmark Verifier</Link></li>
              <li><Link to="/custom-atelier" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Bespoke Ring Studio 3D</Link></li>
              <li><Link to="/billing" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Store Counter Billing</Link></li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-xs font-semibold text-[#B59A6C] tracking-[0.2em] uppercase mb-4">The Atelier</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Our Heritage &amp; Karigars</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Visit Didwana Showroom (341303)</Link></li>
              <li><Link to="/gifting" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Luxury E-Gift Cards</Link></li>
              <li><Link to="/store-grid" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Curated Catalog</Link></li>
              <li><Link to="/profile" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Privé Patron Portal</Link></li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-xs font-semibold text-[#B59A6C] tracking-[0.2em] uppercase mb-4">Trust &amp; Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Privacy &amp; Data Protection</Link></li>
              <li><Link to="/terms-and-conditions" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Terms &amp; Exchange Policy</Link></li>
              <li><Link to="/sitemap" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Atelier Sitemap</Link></li>
              <li className="pt-2">
                <span className="inline-block px-2.5 py-1 text-[10px] font-mono text-[#B59A6C] border border-[#B59A6C]/40 bg-[#B59A6C]/10 uppercase tracking-widest">
                  BIS 916 HALLMARKED
                </span>
              </li>
            </ul>
          </motion.div>

        </div>

        {/* Showroom Details Strip */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="mb-12"
        >
           <p className="text-white/60 font-body text-xs sm:text-sm flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center text-center">
             <span>Flagship Showroom: {STORE_CONFIG.address.full}</span>
             <span className="hidden md:inline text-white/30">•</span>
             <span>Customer Care: +91 9351214851</span>
             <span className="hidden md:inline text-white/30">•</span>
             <span>{STORE_CONFIG.contact.email}</span>
           </p>
           <p className="text-white/40 font-mono text-[10px] text-center mt-2">
             GSTIN: {STORE_CONFIG.gstin} | HSN Code: {STORE_CONFIG.hsn} | Central BIS Hallmark License: {STORE_CONFIG.bisLicense}
           </p>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center mt-12 gap-3"
        >
          <p className="text-white/40 text-xs font-body">
            Copyright &copy; Monika Jewellers 2024. All Rights Reserved. Handcrafted in India.
          </p>
          <Link to="/billing" className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#B59A6C] hover:text-white uppercase tracking-widest transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" /> ATELIER BILLING CONSOLE
          </Link>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;
