import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <footer className="bg-[#222222] text-white py-20">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-16">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="col-span-1 lg:col-span-1"
          >
            <Link to="/">
              <h2 className="text-3xl font-heading text-[#B59A6C] tracking-wider uppercase mb-4">GLIMMR</h2>
            </Link>
            <p className="text-white/60 font-body text-xs max-w-xs mb-6">
              Indulge in the opulence of Golden Memory, a mesmerizing jewelry collection fit for a queen.
            </p>
            {/* Newsletter Section */}
            <form onSubmit={handleSubscribe} className="flex border-b border-white/20 pb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-transparent border-none focus:outline-none text-white placeholder-white/40 flex-1 font-body text-xs"
              />
              <button
                type="submit"
                className="text-[#B59A6C] hover:text-white font-body text-xs tracking-widest uppercase transition-colors"
              >
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-xs font-semibold text-[#B59A6C] tracking-[0.2em] uppercase mb-4">Categories</h4>
            <ul className="space-y-3">
              <li><Link to="/store-grid/earring" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Earrings</Link></li>
              <li><Link to="/store-grid/necklace" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Necklace</Link></li>
              <li><Link to="/store-grid/bracelet" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Bracelet</Link></li>
              <li><Link to="/store-grid/rings" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs font-bold text-white">Rings</Link></li>
              <li><Link to="/store-grid/watches" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Watches</Link></li>
              <li><Link to="/store-grid" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Men's Jewelry</Link></li>
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
              HELP &amp; SERVICES
            </h4>
            <ul className="space-y-3">
              <li><Link to="/size-guide" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Size Guide</Link></li>
              <li><Link to="/care-instructions" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Jewelry Care</Link></li>
              <li><Link to="/live-rates" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Live Metal Rates</Link></li>
              <li><Link to="/about" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">BIS Hallmarking</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Patron Concierge</Link></li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-xs font-semibold text-[#B59A6C] tracking-[0.2em] uppercase mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Home</Link></li>
              <li><Link to="/live-rates" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Live Metal Rates</Link></li>
              <li><Link to="/about" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">About Us</Link></li>
              <li><Link to="/store-grid" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Products</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Contact</Link></li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-xs font-semibold text-[#B59A6C] tracking-[0.2em] uppercase mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Terms &amp; Condition</Link></li>
              <li><Link to="/sitemap" className="text-white/60 hover:text-[#B59A6C] transition-colors font-body text-xs">Sitemap</Link></li>
            </ul>
          </motion.div>

        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="mb-12"
        >
           <p className="text-white/60 font-body text-sm flex flex-col md:flex-row gap-2 md:gap-4 justify-center items-center text-center">
             <span>123 Main Street Chicago, IL 60601 United States</span>
             <span className="hidden md:inline">|</span>
             <span>+1 (234) 567 890</span>
             <span className="hidden md:inline">|</span>
             <span>support@glimmr.com</span>
           </p>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10 flex justify-center mt-12"
        >
          <p className="text-white/40 text-sm font-body">
            Copyright &copy; GLIMMR 2024
          </p>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;
