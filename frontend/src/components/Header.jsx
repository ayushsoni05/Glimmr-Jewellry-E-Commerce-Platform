import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [liveRates, setLiveRates] = useState({ gold: 15064, silver: 231 });
  const [isLiveRatesHovered, setIsLiveRatesHovered] = useState(false);

  useEffect(() => {
    const fetchHeaderRates = () => {
      api.get('/prices/latest')
        .then(res => {
          if (res.data) {
            setLiveRates({
              gold: res.data.gold?.price || 15064,
              silver: res.data.silver?.price || 231
            });
          }
        })
        .catch(() => {});
    };

    fetchHeaderRates();
    const interval = setInterval(fetchHeaderRates, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, []);
  
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateWishlistCount = () => {
      localStorage.setItem('wishlist', '[]');
      setWishlistCount(0);
    };
    
    updateWishlistCount();
    window.addEventListener('storage', updateWishlistCount);
    window.addEventListener('wishlist-updated', updateWishlistCount);
    
    return () => {
      window.removeEventListener('storage', updateWishlistCount);
      window.removeEventListener('wishlist-updated', updateWishlistCount);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const categoryDropdownItems = [
    {
      name: 'BRACELETS',
      slug: 'bracelet',
      image: 'https://framerusercontent.com/images/DdMSTOefO0YEho190OisMkszb8.png?width=430&height=645'
    },
    {
      name: 'EARRINGS',
      slug: 'earring',
      image: 'https://framerusercontent.com/images/VUCxKLRtAXtB7J9fhWKrMpxLg.png?width=430&height=645'
    },
    {
      name: 'RINGS',
      slug: 'rings',
      image: 'https://framerusercontent.com/images/nYmBPU9wzxN2XzOy4Mors5JiA.png?width=430&height=645'
    },
    {
      name: 'NECKLACES',
      slug: 'necklace',
      image: 'https://framerusercontent.com/images/ye7CD1FwMK23YrmwGKBxPmwkxs.png?width=430&height=645'
    },
    {
      name: 'WATCHES',
      slug: 'watches',
      image: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png?width=430&height=645'
    }
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#FAF9F7] py-2.5 border-b border-gray-100 text-xs font-body text-[#808080]">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Join the Social Club for exclusive Rewards</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/live-rates" className="hidden md:flex items-center gap-2 text-[#222222] hover:text-[#B59A6C] transition-colors font-medium">
              <span>Live Metal Rates:</span>
              <span className="font-mono text-xs text-[#B59A6C] font-bold">Gold ₹{liveRates.gold.toLocaleString('en-IN')}/g • Silver ₹{liveRates.silver.toLocaleString('en-IN')}/g</span>
            </Link>
            <span>( +123 ) 456 7890</span>
            <div className="hidden sm:flex items-center space-x-3 text-[#222222]">
              <a href="#" className="hover:text-black transition-colors font-medium">X</a>
              <a href="#" className="hover:text-black transition-colors font-medium">IG</a>
              <a href="#" className="hover:text-black transition-colors font-medium">FB</a>
            </div>
          </div>
        </div>
      </div>

      <header className={`bg-white sticky top-0 z-50 transition-all duration-300 h-20 border-b border-gray-100/80 relative ${isScrolled ? 'shadow-soft' : ''}`}>
        <nav className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          {/* Logo Left */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="font-heading text-2xl tracking-widest text-[#222222] uppercase font-bold">GLIMMR</span>
          </Link>

          {/* Nav Links Center */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 font-body text-sm font-medium tracking-wider text-[#222222] uppercase">
            <Link to="/" className="relative group py-2">
              HOME
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#222222] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/store-grid" className="relative group py-2">
              STORE
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#222222] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {/* Categories Framer Motion Trigger */}
            <div 
              className="relative py-2 cursor-pointer"
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <Link to="/collections" className="flex items-center gap-1.5 group">
                CATEGORIES
                <svg className={`w-3 h-3 transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#222222] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            {/* Webflow & Framer Motion Interactive Live Metal Rates Component */}
            <div 
              className="relative py-1"
              onMouseEnter={() => setIsLiveRatesHovered(true)}
              onMouseLeave={() => setIsLiveRatesHovered(false)}
            >
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                <Link 
                  to="/live-rates" 
                  className="inline-flex items-center gap-2 py-2 text-xs font-body font-bold text-[#222222] hover:text-[#B59A6C] transition-colors relative group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B59A6C]" />
                  <span>LIVE RATES</span>
                  <span className="font-mono text-[9px] px-1 py-0.2 bg-[#FAF9F7] border border-[#E5E2D9] text-[#B59A6C] font-bold">IBJA</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#222222] transition-all duration-300 group-hover:w-full" />
                </Link>
              </motion.div>

              {/* Framer Motion Interactive Popover Card */}
              <AnimatePresence>
                {isLiveRatesHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white border border-[#E5E2D9] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-5 z-50 rounded-xl space-y-3 pointer-events-auto"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-mono text-[10px] text-[#B59A6C] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        IBJA OFFICIAL TICKER
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">1H HOURLY REFRESH</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-[#FAF9F7] p-2.5 border border-[#E5E2D9]">
                        <div>
                          <span className="text-[10px] font-mono text-gray-500 block uppercase">24K PURE GOLD</span>
                          <span className="font-mono font-bold text-xs text-[#222222]">₹{liveRates.gold.toLocaleString('en-IN')}/g</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#B59A6C] font-bold">₹{Math.round(liveRates.gold * 10).toLocaleString('en-IN')}/10g</span>
                      </div>

                      <div className="flex items-center justify-between bg-[#FAF9F7] p-2.5 border border-[#E5E2D9]">
                        <div>
                          <span className="text-[10px] font-mono text-gray-500 block uppercase">925 STERLING SILVER</span>
                          <span className="font-mono font-bold text-xs text-[#222222]">₹{liveRates.silver.toLocaleString('en-IN')}/g</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#B59A6C] font-bold">₹{Math.round(liveRates.silver * 10).toLocaleString('en-IN')}/10g</span>
                      </div>
                    </div>

                    <Link 
                      to="/live-rates" 
                      className="block text-center text-[10px] font-mono font-bold text-[#222222] hover:text-[#B59A6C] uppercase tracking-wider pt-1 hover:underline"
                    >
                      OPEN FULL ANALYTICS DASHBOARD →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/about" className="relative group py-2">
              ABOUT
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#222222] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/contact" className="relative group py-2">
              CONTACT
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#222222] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4 sm:space-x-6 flex-shrink-0">
            <button onClick={toggleSearch} className="text-[#222222] hover:text-black transition-colors" title="Search">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {user ? (
              <div className="relative group">
                <button className="text-[#222222] hover:text-black transition-colors flex items-center gap-1">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-soft rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100 p-2 z-50">
                  <Link to="/profile" className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#FAF9F7] hover:font-bold rounded-xl transition-colors font-body">Profile</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#FAF9F7] hover:font-bold rounded-xl transition-colors font-body">Admin Panel</Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2.5 text-sm text-[#222222] hover:bg-[#FAF9F7] hover:font-bold rounded-xl transition-colors font-body"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="text-[#222222] hover:text-black transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            <Link to="/wishlist" className="text-[#222222] hover:text-black transition-colors relative">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#222222] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-mono">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="text-[#222222] hover:text-black transition-colors relative">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#222222] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </Link>

            <button onClick={toggleMobileMenu} className="md:hidden text-[#222222] hover:text-black transition-colors z-50 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Full-Width Horizontally Centered Categories Mega-Menu Dropdown */}
        <AnimatePresence>
          {isCategoryDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="absolute top-full left-0 right-0 w-full bg-white border-t border-b border-gray-100 shadow-[0_25px_60px_rgba(0,0,0,0.12)] z-50 flex justify-center py-8 px-4 sm:px-6 lg:px-8"
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <div className="w-full max-w-[1160px] grid grid-cols-5 gap-6 lg:gap-8">
                {categoryDropdownItems.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to={`/store-grid/${item.slug}`}
                      onClick={() => setIsCategoryDropdownOpen(false)}
                      className="group block text-center"
                    >
                      <div className="aspect-[430/645] bg-[#FAF9F7] overflow-hidden relative border border-gray-200/60 group-hover:border-[#222222] transition-all duration-300 shadow-sm group">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Framer Motion Animated "VIEW COLLECTION" Hover Overlay Button */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5 px-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-2.5 px-3 bg-white/95 backdrop-blur-md text-[#222222] font-heading text-[10px] font-semibold tracking-[0.25em] uppercase border border-white/60 shadow-md group-hover:bg-white transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>VIEW COLLECTION</span>
                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                      <span className="font-heading text-[12px] font-normal tracking-[0.3em] text-[#222222] uppercase mt-4 block group-hover:text-black transition-colors">
                        {item.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-soft border-t border-gray-100 z-40 transition-all">
            <div className="container mx-auto px-4 py-6 max-w-3xl">
              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for jewelry, diamonds, gold..."
                    className="w-full px-6 py-4 bg-[#FAF9F7] border border-gray-200 rounded-full focus:outline-none focus:border-[#222222] text-[#222222] font-body placeholder-muted transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#222222] hover:bg-black text-white p-2.5 rounded-full transition-colors cursor-pointer"
                    title="Search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="px-4 py-3 text-[#808080] hover:text-[#222222] transition-colors font-body text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu Full-screen Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-0 bg-white z-40 overflow-y-auto pt-24 pb-12 px-6 md:hidden"
            >
              <div className="flex flex-col space-y-6 text-xl font-heading text-[#222222] tracking-wider uppercase">
                <Link to="/" className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
                <Link to="/store-grid" className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>STORE</Link>
                
                <div className="border-b border-gray-100 pb-2">
                  <button 
                    onClick={() => setOpenCategory(openCategory === 'categories' ? null : 'categories')}
                    className="w-full flex items-center justify-between hover:text-[#B59A6C] transition-colors uppercase"
                  >
                    CATEGORIES
                    <svg className={`w-5 h-5 transition-transform ${openCategory === 'categories' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {openCategory === 'categories' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 pl-4 flex flex-col space-y-3 text-base font-body text-[#808080] uppercase tracking-wider">
                          <Link to={`/store-grid/earring`} className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>EARRING</Link>
                          <Link to={`/store-grid/necklace`} className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>NECKLACE</Link>
                          <Link to={`/store-grid/bracelet`} className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>BRACELET</Link>
                          <Link to={`/store-grid/rings`} className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>RINGS</Link>
                          <Link to={`/store-grid/watches`} className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>WATCHES</Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link 
                  to="/live-rates" 
                  className="hover:text-[#B59A6C] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  LIVE RATES
                </Link>

                <Link to="/about" className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>ABOUT</Link>
                <Link to="/contact" className="hover:text-[#B59A6C] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>CONTACT</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
