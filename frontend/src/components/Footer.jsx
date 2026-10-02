import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Brand logo

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
    <footer className="bg-[#222222] text-white py-12 sm:py-20">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
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

          {/* HELP & SERVICES Section with Light Premium Icons */}
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
              <li><Link to="/contact" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Visit Mumbai Showroom</Link></li>
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

        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="mb-12"
        >
           <p className="text-white/60 font-body text-xs sm:text-sm flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center text-center">
             <span>Flagship Showroom: Jewel Arcade, Zaveri Bazaar &amp; BKC, Mumbai 400051</span>
             <span className="hidden md:inline text-white/30">•</span>
             <span>Customer Care: +91 (022) 2345 6789 / +91 98200 12345</span>
             <span className="hidden md:inline text-white/30">•</span>
             <span>care@monikajewellers.com</span>
           </p>
           <p className="text-white/40 font-mono text-[10px] text-center mt-2">
             GSTIN: 27AAAAA0000A1Z5 | HSN Code: 7113 | Central BIS Hallmark License: HM-916-84920
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
