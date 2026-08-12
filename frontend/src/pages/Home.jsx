import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useMetalRates } from '../contexts/MetalRatesContext';
import GlimmrLoader from '../components/GlimmrLoader';
import { getProductImage } from '../utils/productImages';
import { FRAMER_IMAGES, FRAMER_ICONS } from '../utils/framerAssets';
import MonthlyUpdatesNewsletter from '../components/MonthlyUpdatesNewsletter';

const Home = () => {
  const { user } = useAuth();
  const { getLiveProductPrice } = useMetalRates();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/featured');
        setFeaturedProducts(res.data.products || []);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const faqs = [
    "Are your products certified and of high quality?",
    "What payment methods do you accept?",
    "Are your materials ethically sourced?",
    "Do you offer customization options for jewelry?",
    "How do I determine my ring size for online purchases?",
    "Do you offer personalized messages for special times?",
    "Can I choose my preferred metal or gemstone?",
    "Do you offer international shipping?",
  ];

  const newArrivals = [
    { name: "Silver Chain Watch", price: 14999, image: FRAMER_PRODUCTS[6]?.image },
    { name: "Gold Pearl Ring", price: 38999, image: FRAMER_PRODUCTS[7]?.image },
    { name: "Gold Chain Necklace", price: 11499, image: FRAMER_PRODUCTS[8]?.image },
    { name: "Bronze Plants Earrings", price: 5999, image: FRAMER_PRODUCTS[2]?.image }
  ];

  return (
    <div className="min-h-screen bg-white font-body text-[#222222]">
      {/* 1. HERO SECTION (1:1 Replica from Reference Screenshot & Framer 700px Desktop Spec) */}
      <section className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Card 1: Left Dark Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-[520px] sm:h-[600px] lg:h-[700px] rounded-[16px] lg:rounded-[24px] overflow-hidden group flex flex-col justify-between p-8 sm:p-12 text-center shadow-sm"
          >
            <img
              src={FRAMER_IMAGES.hero}
              alt="Discover Your Perfect Style"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Top Eyebrow */}
            <div className="relative z-10 pt-2">
              <span className="font-body text-xs text-white/90 tracking-[0.3em] uppercase font-medium">
                COLLECTIONS
              </span>
            </div>

            {/* Center Heading & Button */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-normal font-normal leading-[1.15] mb-8 max-w-md">
                Discover Your<br />Perfect Style
              </h1>
              <Link
                to="/store-grid"
                className="inline-block border border-white text-white bg-transparent px-8 py-3 text-xs tracking-[0.2em] font-mono font-semibold uppercase hover:bg-white hover:text-[#222222] transition-colors"
              >
                SHOP NOW
              </Link>
            </div>

            <div className="relative z-10 pb-2"></div>
          </motion.div>

          {/* Card 2: Right Light Hero Card (Golden Memory) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative h-[520px] sm:h-[600px] lg:h-[700px] rounded-[16px] lg:rounded-[24px] overflow-hidden group flex flex-col justify-between p-8 sm:p-12 text-left bg-[#F5F2EC] shadow-sm"
          >
            <img
              src={FRAMER_IMAGES.goldenMemory}
              alt="Golden Memory"
              className="absolute inset-0 w-full h-full object-cover object-right transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FAF9F7]/95 via-[#FAF9F7]/50 to-transparent"></div>

            {/* Top Eyebrow */}
            <div className="relative z-10 pt-2">
              <span className="font-body text-xs text-[#222222]/80 tracking-[0.3em] uppercase font-medium">
                SHOP
              </span>
            </div>

            {/* Bottom Left Content */}
            <div className="relative z-10 mt-auto pb-2 max-w-md">
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#222222] tracking-normal font-normal leading-[1.15] mb-4">
                Golden<br />Memory
              </h2>
              <p className="font-body text-[#555555] text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-sm">
                Indulge in the opulence of Golden Memory, a mesmerizing jewelry collection fit for a queen. Embrace your inner allure with exquisite designs exclusive in our store to your heart content.
              </p>
            </div>

            {/* Bottom Right Floating Button */}
            <div className="absolute bottom-6 right-6 z-20">
              <Link
                to="/store-grid"
                className="bg-white/95 backdrop-blur-sm border border-gray-200/80 shadow-md rounded-lg px-4 py-2.5 text-xs font-semibold text-[#222222] flex items-center gap-2 hover:bg-gray-50 hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Purchase Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST BADGES ROW */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#FAF9F7] p-8 max-w-[1520px] mx-auto my-8 rounded-[24px] border border-gray-100 px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <img src={FRAMER_ICONS.certified} alt="Certified" className="w-10 h-10 mb-4 object-contain" />
            <h3 className="font-heading text-lg uppercase tracking-wider mb-2 text-[#222222]">Certified</h3>
            <p className="text-[#808080] text-sm font-body">Available certificates of authenticity</p>
          </div>
          <div className="flex flex-col items-center">
            <img src={FRAMER_ICONS.secure} alt="Secure" className="w-10 h-10 mb-4 object-contain" />
            <h3 className="font-heading text-lg uppercase tracking-wider mb-2 text-[#222222]">Secure</h3>
            <p className="text-[#808080] text-sm font-body">Certified marketplace since 2017</p>
          </div>
          <div className="flex flex-col items-center">
            <img src={FRAMER_ICONS.shipping} alt="Shipping" className="w-10 h-10 mb-4 object-contain" />
            <h3 className="font-heading text-lg uppercase tracking-wider mb-2 text-[#222222]">Shipping</h3>
            <p className="text-[#808080] text-sm font-body">Free, fast, and reliable worldwide</p>
          </div>
          <div className="flex flex-col items-center">
            <img src={FRAMER_ICONS.transparent} alt="Transparent" className="w-10 h-10 mb-4 object-contain" />
            <h3 className="font-heading text-lg uppercase tracking-wider mb-2 text-[#222222]">Transparent</h3>
            <p className="text-[#808080] text-sm font-body">Hassle-free return policy</p>
          </div>
        </div>
      </motion.section>

      {/* 3. TWO PROMO BANNERS ROW (1:1 Match for Luxe Abundance & Sparkle in Love Screenshot) */}
      <section className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Banner 1: Luxe Abundance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#FAF9F7] rounded-[24px] p-8 lg:p-12 relative overflow-hidden flex flex-col justify-between min-h-[260px] sm:min-h-[280px] border border-gray-100/80"
          >
            <div className="relative z-10 max-w-[60%] sm:max-w-[55%]">
              <h2 className="font-heading text-3xl sm:text-4xl text-[#222222] font-bold mb-2 leading-tight">
                Luxe Abundance
              </h2>
              <p className="font-body text-[#666666] text-sm mb-8 leading-relaxed">
                Get 20% off with our code: LUXE20.
              </p>
              <Link
                to="/store-grid"
                className="font-body font-semibold text-xs text-[#222222] hover:text-[#B59A6C] transition-colors inline-flex items-center gap-2 group uppercase tracking-wider"
              >
                View Full Collection
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full">
              <img
                src={FRAMER_IMAGES.goldenMemory}
                alt="Luxe Abundance"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>

          {/* Banner 2: Sparkle in Love */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-[#FAF9F7] rounded-[24px] p-8 lg:p-12 relative overflow-hidden flex flex-col justify-between min-h-[260px] sm:min-h-[280px] border border-gray-100/80"
          >
            <div className="relative z-10 max-w-[60%] sm:max-w-[55%]">
              <h2 className="font-heading text-3xl sm:text-4xl text-[#222222] font-bold mb-2 leading-tight">
                Sparkle in Love
              </h2>
              <p className="font-body text-[#666666] text-sm mb-8 leading-relaxed">
                Make her say yes with our 50% off rings.
              </p>
              <Link
                to="/store-grid/rings"
                className="font-body font-semibold text-xs text-[#222222] hover:text-[#B59A6C] transition-colors inline-flex items-center gap-2 group uppercase tracking-wider"
              >
                View Full Collection
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full">
              <img
                src={FRAMER_IMAGES.sparklePromo}
                alt="Sparkle in Love"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS GRID */}
      <section className="py-12 max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-3xl text-center uppercase tracking-wider text-[#222222] mb-12 font-bold">Featured Collections</h2>
        </motion.div>
        
        {loading ? (
          <GlimmrLoader subtitle="LOADING FEATURED ATELIER PIECES..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.slice(0, 4).map((product, index) => {
              const productId = product._id || product.id;
              const livePricing = getLiveProductPrice(product);
              const priceText = `₹${livePricing.totalLivePrice.toLocaleString('en-IN')}`;

              return (
                <motion.div key={productId || index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Link to={`/products/${productId}`} className="block group">
                    <div className="aspect-square rounded-[20px] bg-[#FAF9F7] p-6 flex items-center justify-center mb-3 overflow-hidden group-hover:shadow-sm transition-all">
                      <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-contain max-h-[180px] sm:max-h-[210px] transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h3 className="font-body text-sm font-medium text-[#222222] mt-3 text-center">{product.name}</h3>
                    <p className="font-body text-[#B59A6C] text-sm font-semibold mt-1 text-center">
                      {priceText}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
        
        <div className="text-center mt-12">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 350, damping: 22 }} className="inline-block">
            <Link to="/store-grid" className="inline-block border border-[#222222] rounded-full px-8 py-3.5 text-xs tracking-wider uppercase font-semibold text-[#222222] hover:bg-[#222222] hover:text-white transition-colors">
              VIEW ALL PRODUCTS
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. MINIMAL ME COLLECTION BANNER (1:1 Framer Spec) */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-[1520px] mx-auto my-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="relative h-[360px] sm:h-[440px] lg:h-[500px] rounded-[24px] overflow-hidden flex items-center p-8 sm:p-12 lg:p-16 border border-gray-100/80 shadow-sm">
          <img
            src={FRAMER_IMAGES.minimalMeBanner}
            alt="Minimal Me Collection"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/65 to-transparent"></div>

          <div className="relative z-10 max-w-lg">
            <span className="font-body text-xs text-[#222222]/80 tracking-[0.3em] uppercase font-medium block mb-3">
              C O L L E C T I O N
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#222222] font-bold tracking-normal leading-tight mb-4">
              Minimal Me
            </h2>
            <p className="font-body text-[#555555] text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              Introducing our new minimalist collection. Suitable for the active yet elegant.
            </p>
            <Link
              to="/store-grid"
              className="inline-block border border-[#222222] text-[#222222] bg-transparent px-8 py-3.5 text-xs tracking-[0.2em] font-mono font-semibold uppercase hover:bg-[#222222] hover:text-white transition-colors"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 7. NEW ARRIVALS SECTION */}
      <section className="py-12 max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-3xl text-center uppercase tracking-wider text-[#222222] mb-12 font-bold">New Arrival</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {newArrivals.map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <Link to={`/products/${item.id || item._id || 'femme-chronos-watch'}`} className="block group">
                <div className="aspect-square rounded-[20px] bg-[#FAF9F7] p-6 flex items-center justify-center mb-3 overflow-hidden group-hover:shadow-sm transition-all">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain max-h-[180px] sm:max-h-[210px] transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="font-body text-sm font-medium text-[#222222] mt-3 text-center">{item.name}</h3>
                <p className="font-body text-[#B59A6C] text-sm font-semibold mt-1 text-center">
                  ₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : item.price}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 350, damping: 22 }} className="inline-block">
            <Link to="/store-grid?sort=newest" className="inline-block border border-[#222222] rounded-full px-8 py-3.5 text-xs tracking-wider uppercase font-semibold text-[#222222] hover:bg-[#222222] hover:text-white transition-colors">
              View All New Arrival
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 8. WEDDING / ENGAGEMENT BANNER (1:1 Exact Replica of Reference Design) */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative max-w-[1520px] mx-auto my-12 overflow-hidden bg-[#EAEAE8] border border-gray-200/80 p-6 sm:p-10 lg:p-14 min-h-[420px] sm:min-h-[480px] flex items-center justify-end"
      >
        {/* Background Studio Image with Pedestal, Standing Ring, and White Vase */}
        <div className="absolute inset-0 z-0">
          <img
            src={FRAMER_IMAGES.weddingBanner}
            alt="Simple Engagement Ring Studio"
            className="w-full h-full object-cover object-left"
          />
        </div>

        {/* Right Floating White Card with Inner Gold Border Frame */}
        <div className="relative z-10 w-full md:w-[480px] lg:w-[520px] bg-white p-4 sm:p-6 text-center shadow-lg border border-gray-100">
          <div className="border border-[#C5A572]/60 p-6 sm:p-10 flex flex-col items-center justify-center">
            <span className="font-body text-[11px] font-bold tracking-[0.25em] uppercase text-[#B59A6C] mb-3 block">
              FLASH SALE
            </span>
            <h2 className="font-body text-xl sm:text-2xl lg:text-3xl text-[#222222] font-bold mb-3 tracking-tight">
              Simple Engagement Ring
            </h2>
            <p className="font-body text-[#777777] text-xs sm:text-sm leading-relaxed mb-6 max-w-xs mx-auto">
              Embrace the beauty of understated elegance with our simple engagement ring, a timeless symbol of love and commitment.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}>
              <Link
                to="/store-grid/rings"
                className="inline-block bg-[#B59A6C] hover:bg-[#A38B5F] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] transition-all rounded-none shadow-sm"
              >
                SHOP NOW
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 9. QUESTIONS / FAQ ACCORDION */}
      <section className="py-12 max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-3xl text-center uppercase tracking-wider text-[#222222] mb-12 font-bold">Questions</h2>
        </motion.div>
        
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-200 overflow-hidden"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
              >
                <span className="font-body text-[#222222] text-base font-medium">{faq}</span>
                <span className="text-[#B59A6C] text-xl ml-4 font-light">{openFaq === index ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-body text-[#808080] text-sm pb-4 pr-8">
                      We strive to provide the best quality and service. Please reach out to our support team if you have any specific inquiries regarding this topic.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 10. NEWSLETTER SECTION ("Get Monthly Updates") */}
      <MonthlyUpdatesNewsletter />
    </div>
  );
};

export default Home;
