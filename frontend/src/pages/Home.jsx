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
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products/featured');
        const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        if (!cancelled && list.length > 0) {
          setFeaturedProducts(list);
        } else if (!cancelled) {
          // Fallback to top general products
          const res2 = await api.get('/products');
          const list2 = Array.isArray(res2.data) ? res2.data : (res2.data?.products || []);
          if (!cancelled) setFeaturedProducts(list2);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        try {
          const res2 = await api.get('/products');
          const list2 = Array.isArray(res2.data) ? res2.data : (res2.data?.products || []);
          if (!cancelled) setFeaturedProducts(list2);
        } catch {}
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  const faqs = [
    {
      q: "How can I verify the 100% BIS 916 Hallmark and HUID on Monika Jewellers gold?",
      a: "Every gold creation at Monika Jewellers carries the official Central Bureau of Indian Standards (BIS) hallmark triangle, the karat purity stamp (916 for 22K, 750 for 18K), and a laser-engraved 6-character alphanumeric Hallmark Unique Identification (HUID) code. You can verify this code immediately on our online Certificate Verifier or through the official Government of India BIS Care mobile application."
    },
    {
      q: "How is the final price calculated on your website?",
      a: "We adhere strictly to transparent IBJA-benchmarked pricing with zero hidden margins. The price of every piece is clearly itemized into: Net Metal Weight × Live IBJA Gold/Silver Rate × Karat Purity + Transparent Artisan Making Charges + Certified Gemstone Value + 3% GST. You can view the live mathematical price breakup on every product page."
    },
    {
      q: "Are the solitaires and diamonds independently certified?",
      a: "Yes. Every solitaire and diamond jewel at Monika Jewellers is 100% natural, conflict-free, and graded by internationally accredited gemological laboratories including IGI (International Gemological Institute), GIA, and SGL. Your order arrives with a physical laboratory certificate documenting the 4Cs (Carat, Color, Clarity, Cut)."
    },
    {
      q: "Do you offer an Old Gold Exchange & Lifetime Buyback policy?",
      a: "Yes, we honor a lifetime exchange and buyback guarantee. When exchanging your old gold jewellery with Monika Jewellers, we conduct 100% non-destructive Karatmeter purity testing right in front of you. You receive full prevailing market bullion value with zero melting deduction on hallmarked pieces."
    },
    {
      q: "How do I choose the correct Indian ring or bangle size?",
      a: "We use standard Indian Ring Sizes (Sizes 9 to 25+) and Indian Bangle Anna Sizes (2.2, 2.4, 2.6, 2.8, 2.10). You can check our interactive digital Size Guide on the website for millimeter measurements or request a complimentary ring sizing tool from our concierge."
    },
    {
      q: "Is online delivery safe and insured during transit?",
      a: "Every parcel dispatched by Monika Jewellers is 100% transit-insured with specialized high-value logistics partners (BVC Logistics, Sequel, Blue Dart Apex). All shipments arrive in tamper-evident sealed security packaging and are handed over strictly upon confidential recipient OTP verification."
    },
    {
      q: "Can I customize a bespoke bridal set or schedule a private showroom appointment?",
      a: "Yes! Through our interactive Master 3D Ring Studio and Bespoke Atelier, you can submit your own design prompts, reference sketches, or heirloom revival requests. You can also schedule a private one-on-one consultation with our master stylist via video call or visit our flagship Mumbai showroom in Zaveri Bazaar & BKC."
    },
    {
      q: "What payment and EMI methods are accepted?",
      a: "We accept all Indian UPI apps (Google Pay, PhonePe, Paytm, BHIM), Net Banking across 50+ major banks, Credit & Debit Cards (Visa, MasterCard, RuPay, Amex), and flexible 0% interest monthly instalment (EMI) plans. For our physical showroom and offline billing counter, we also support cash, card, and split payment allocation."
    }
  ];

  const patronStories = [
    {
      patron: "Pooja & Siddharth Mehta",
      city: "Mumbai, Maharashtra",
      occasion: "Vivaha Bridal Kundan Trousseau",
      quote: "Finding our bridal jewellery was an emotional journey. Monika Jewellers gave us complete transparency on gold weight and making charges, and the 22K Kundan necklace looked like an imperial heirloom. Our family has found our lifelong jeweller.",
      item: "Royal Vivaha Kundan Choker & Jhumka Set"
    },
    {
      patron: "Ananya & Rohan Iyer",
      city: "Bengaluru, Karnataka",
      occasion: "Sagai VVS1 Solitaire Ring",
      quote: "I designed my fiancée's engagement ring using their 3D Studio and visited the atelier. The IGI certified diamond sparkles with breathtaking fire, and the custom inner engraving made it unforgettable.",
      item: "1.75 ct Brilliant Oval Solitaire (18K Rose Gold)"
    },
    {
      patron: "Kavita R. Singhania",
      city: "Jaipur, Rajasthan",
      occasion: "Dhanteras Shagun & Temple Kadas",
      quote: "Every year on Dhanteras, we invest in pure gold. The 24K Laxmi shagun coins and Nakshi temple bangles arrived in sealed insured tamper-proof boxes with prompt OTP delivery. Trust is everything in jewelry, and Monika Jewellers embodies it.",
      item: "Antique Nakshi Peacock Kada Bangles"
    }
  ];

  const newArrivals = featuredProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-white font-body text-[#222222]">
      {/* 1. HERO SECTION */}
      <section className="max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Card 1: Left Dark Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-[460px] sm:h-[580px] lg:h-[700px] rounded-[16px] lg:rounded-[24px] overflow-hidden group flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-center shadow-sm"
          >
            <img
              src={FRAMER_IMAGES.hero}
              alt="Vivaha Bridal Heritage"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Top Eyebrow */}
            <div className="relative z-10 pt-2">
              <span className="font-body text-[11px] sm:text-xs text-[#B59A6C] tracking-[0.3em] uppercase font-bold bg-black/40 px-3 py-1 rounded-full">
                VIVAHA BRIDAL HERITAGE
              </span>
            </div>

            {/* Center Heading & Button */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-white tracking-normal font-normal leading-[1.15] mb-4 sm:mb-6 max-w-md">
                Sacred Traditions,<br />Eternal Heirlooms
              </h1>
              <p className="font-body text-white/80 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
                Handcrafted 22K pure gold, imperial Kundan and uncut Polki bridal suites created for your most cherished auspicious moments.
              </p>
              <Link
                to="/collections"
                className="inline-block border border-white text-white bg-transparent px-6 sm:px-8 py-2.5 sm:py-3 text-[11px] sm:text-xs tracking-[0.2em] font-mono font-semibold uppercase hover:bg-white hover:text-[#222222] transition-colors"
              >
                EXPLORE BRIDAL SUITE
              </Link>
            </div>

            <div className="relative z-10 pb-2">
              <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">
                100% BIS 916 HALLMARKED • CERTIFIED NATURAL GEMSTONES
              </span>
            </div>
          </motion.div>

          {/* Card 2: Right Light Hero Card (Royal Sagai & Solitaires) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative h-[460px] sm:h-[580px] lg:h-[700px] rounded-[16px] lg:rounded-[24px] overflow-hidden group flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-left bg-[#F5F2EC] shadow-sm"
          >
            <img
              src={FRAMER_IMAGES.goldenMemory}
              alt="Sagai Engagement Solitaires"
              className="absolute inset-0 w-full h-full object-cover object-right transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FAF9F7]/95 via-[#FAF9F7]/70 to-transparent"></div>

            {/* Top Eyebrow */}
            <div className="relative z-10 pt-2">
              <span className="font-body text-[11px] sm:text-xs text-[#B59A6C] tracking-[0.3em] uppercase font-bold">
                SAGAI &amp; SOLITAIRE CREATIONS
              </span>
            </div>

            {/* Bottom Left Content */}
            <div className="relative z-10 mt-auto pb-2 max-w-md">
              <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-[#222222] tracking-normal font-normal leading-[1.15] mb-3 sm:mb-4">
                The Royal<br />Shunyata
              </h2>
              <p className="font-body text-[#555555] text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-sm mb-4">
                Celebrate your sacred commitment with IGI &amp; GIA certified natural solitaire diamonds. Masterfully set in pure 18K hallmarked gold with lifetime authenticity buyback.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#B59A6C] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>IBJA LIVE PRICING TRANSPARENCY</span>
              </div>
            </div>

            {/* Bottom Right Floating Button */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
              <Link
                to="/store-grid/rings"
                className="bg-white/95 backdrop-blur-sm border border-gray-200/80 shadow-md rounded-lg px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-semibold text-[#222222] flex items-center gap-2 hover:bg-gray-50 hover:shadow-lg transition-all"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                View Solitaires
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST BADGES ROW (Authentic Indian Jewellery Trust Pillars) */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#FAF9F7] p-5 sm:p-8 max-w-[1520px] mx-auto my-6 sm:my-8 rounded-[16px] sm:rounded-[24px] border border-gray-100 px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 text-center">
          <div className="flex flex-col items-center">
            <img src={FRAMER_ICONS.certified} alt="BIS Hallmark" className="w-8 h-8 sm:w-10 sm:h-10 mb-2.5 sm:mb-4 object-contain" />
            <h3 className="font-heading text-sm sm:text-base uppercase tracking-wider mb-1 text-[#222222] font-bold">100% BIS 916 Hallmark</h3>
            <p className="text-[#707070] text-[11px] sm:text-xs font-body">Laser engraved 6-digit HUID code verifiable on Govt. BIS Care App</p>
          </div>
          <div className="flex flex-col items-center">
            <img src={FRAMER_ICONS.secure} alt="Certified Diamonds" className="w-8 h-8 sm:w-10 sm:h-10 mb-2.5 sm:mb-4 object-contain" />
            <h3 className="font-heading text-sm sm:text-base uppercase tracking-wider mb-1 text-[#222222] font-bold">IGI &amp; GIA Diamonds</h3>
            <p className="text-[#707070] text-[11px] sm:text-xs font-body">100% natural, conflict-free certified stones with complete 4Cs grading</p>
          </div>
          <div className="flex flex-col items-center">
            <img src={FRAMER_ICONS.shipping} alt="Insured Shipping" className="w-8 h-8 sm:w-10 sm:h-10 mb-2.5 sm:mb-4 object-contain" />
            <h3 className="font-heading text-sm sm:text-base uppercase tracking-wider mb-1 text-[#222222] font-bold">Insured Pan-India Transit</h3>
            <p className="text-[#707070] text-[11px] sm:text-xs font-body">Tamper-evident sealed delivery with OTP handover across 19,000+ PINs</p>
          </div>
          <div className="flex flex-col items-center">
            <img src={FRAMER_ICONS.transparent} alt="Transparent Pricing" className="w-8 h-8 sm:w-10 sm:h-10 mb-2.5 sm:mb-4 object-contain" />
            <h3 className="font-heading text-sm sm:text-base uppercase tracking-wider mb-1 text-[#222222] font-bold">Transparent IBJA Pricing</h3>
            <p className="text-[#707070] text-[11px] sm:text-xs font-body">Exact weight &amp; making charges breakdown with lifetime exchange value</p>
          </div>
        </div>
      </motion.section>

      {/* 3. TWO PROMO BANNERS ROW (Indian Festive & Wedding Heritage) */}
      <section className="max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 my-6 sm:my-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Banner 1: Auspicious Vivaha Shagun */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#FAF9F7] rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 lg:p-12 relative overflow-hidden flex flex-col justify-between min-h-[240px] sm:min-h-[280px] border border-gray-100/80"
          >
            <div className="relative z-10 max-w-[75%] sm:max-w-[60%]">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-[#B59A6C] uppercase block mb-1">
                FESTIVE &amp; BRIDAL PRIVILEGE
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#222222] font-bold mb-2 leading-tight">
                Vivaha Shagun
              </h2>
              <p className="font-body text-[#666666] text-xs sm:text-sm mb-6 leading-relaxed">
                Enjoy special making concessions and zero-melting loss on old gold exchange for complete bridal sets.
              </p>
              <Link
                to="/collections"
                className="font-body font-semibold text-xs text-[#222222] hover:text-[#B59A6C] transition-colors inline-flex items-center gap-2 group uppercase tracking-wider"
              >
                View Bridal Trousseau
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full">
              <img
                src={FRAMER_IMAGES.goldenMemory}
                alt="Vivaha Shagun"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/40 to-transparent sm:hidden" />
            </div>
          </motion.div>

          {/* Banner 2: Sagai & Solitaire Expressions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-[#FAF9F7] rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 lg:p-12 relative overflow-hidden flex flex-col justify-between min-h-[240px] sm:min-h-[280px] border border-gray-100/80"
          >
            <div className="relative z-10 max-w-[75%] sm:max-w-[60%]">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.25em] text-[#B59A6C] uppercase block mb-1">
                HANDCRAFTED COMMITMENTS
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#222222] font-bold mb-2 leading-tight">
                Sagai Solitaires
              </h2>
              <p className="font-body text-[#666666] text-xs sm:text-sm mb-6 leading-relaxed">
                Celebrate your engagement with master-cut certified natural diamonds set in 18K yellow, white, and rose gold.
              </p>
              <Link
                to="/store-grid/rings"
                className="font-body font-semibold text-xs text-[#222222] hover:text-[#B59A6C] transition-colors inline-flex items-center gap-2 group uppercase tracking-wider"
              >
                Explore Engagement Bands
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full">
              <img
                src={FRAMER_IMAGES.sparklePromo}
                alt="Sagai Solitaires"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/40 to-transparent sm:hidden" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS GRID */}
      <section className="py-8 sm:py-12 max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-2xl sm:text-3xl text-center uppercase tracking-wider text-[#222222] mb-8 sm:mb-12 font-bold">Featured Collections</h2>
        </motion.div>
        
        {loading ? (
          <GlimmrLoader subtitle="LOADING FEATURED ATELIER PIECES..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
            {featuredProducts.slice(0, 4).map((product, index) => {
              const productId = product._id || product.id;
              const livePricing = getLiveProductPrice(product);
              const priceText = `₹${livePricing.totalLivePrice.toLocaleString('en-IN')}`;

              return (
                <motion.div key={productId || index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <Link to={`/products/${productId}`} className="block group">
                    <div className="aspect-square rounded-[16px] sm:rounded-[20px] bg-[#FAF9F7] p-3.5 sm:p-6 flex items-center justify-center mb-2 sm:mb-3 overflow-hidden group-hover:shadow-sm transition-all">
                      <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-contain max-h-[130px] sm:max-h-[210px] transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h3 className="font-body text-xs sm:text-sm font-medium text-[#222222] mt-2 sm:mt-3 text-center line-clamp-1">{product.name}</h3>
                    <p className="font-body text-[#B59A6C] text-xs sm:text-sm font-semibold mt-0.5 sm:mt-1 text-center">
                      {priceText}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
        
        <div className="text-center mt-8 sm:mt-12">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 350, damping: 22 }} className="inline-block">
            <Link to="/store-grid" className="inline-block border border-[#222222] rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-xs tracking-wider uppercase font-semibold text-[#222222] hover:bg-[#222222] hover:text-white transition-colors">
              VIEW ALL PRODUCTS
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. ROZANA EVERYDAY FINE GOLD BANNER */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-[1520px] mx-auto my-8 sm:my-12 px-3 sm:px-6 lg:px-8"
      >
        <div className="relative h-[320px] sm:h-[420px] lg:h-[500px] rounded-[16px] sm:rounded-[24px] overflow-hidden flex items-center p-6 sm:p-12 lg:p-16 border border-gray-100/80 shadow-sm">
          <img
            src={FRAMER_IMAGES.minimalMeBanner}
            alt="Rozana Everyday Fine Gold Collection"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent sm:via-white/65"></div>

          <div className="relative z-10 max-w-lg">
            <span className="font-body text-[11px] sm:text-xs text-[#B59A6C] tracking-[0.3em] uppercase font-bold block mb-2 sm:mb-3">
              ROZANA COLLECTION • 14K & 18K
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl text-[#222222] font-bold tracking-normal leading-tight mb-2 sm:mb-4">
              Featherlight Daily Gold
            </h2>
            <p className="font-body text-[#555555] text-xs sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md">
              Weightless hallmarked fine gold jewellery crafted for boardroom finesse, casual brunches, and spontaneous celebrations.
            </p>
            <Link
              to="/store-grid"
              className="inline-block border border-[#222222] text-[#222222] bg-transparent px-6 sm:px-8 py-2.5 sm:py-3.5 text-xs tracking-[0.2em] font-mono font-semibold uppercase hover:bg-[#222222] hover:text-white transition-colors"
            >
              EXPLORE ROZANA PIECES
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 7. NEW ARRIVALS SECTION */}
      <section className="py-8 sm:py-12 max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-heading text-2xl sm:text-3xl text-center uppercase tracking-wider text-[#222222] mb-8 sm:mb-12 font-bold">New Arrival</h2>
        </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {newArrivals.map((item, index) => {
            const itemId = item._id || item.id;
            const livePricing = getLiveProductPrice(item);
            const priceText = `₹${livePricing.totalLivePrice.toLocaleString('en-IN')}`;

            return (
              <motion.div key={itemId || index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Link to={`/products/${itemId}`} className="block group">
                  <div className="aspect-square rounded-[16px] sm:rounded-[20px] bg-[#FAF9F7] p-3.5 sm:p-6 flex items-center justify-center mb-2 sm:mb-3 overflow-hidden group-hover:shadow-sm transition-all">
                    <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-contain max-h-[130px] sm:max-h-[210px] transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="font-body text-xs sm:text-sm font-medium text-[#222222] mt-2 sm:mt-3 text-center line-clamp-1">{item.name}</h3>
                  <p className="font-body text-[#B59A6C] text-xs sm:text-sm font-semibold mt-0.5 sm:mt-1 text-center">
                    {priceText}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 350, damping: 22 }} className="inline-block">
            <Link to="/store-grid?sort=newest" className="inline-block border border-[#222222] rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-xs tracking-wider uppercase font-semibold text-[#222222] hover:bg-[#222222] hover:text-white transition-colors">
              View All New Arrival
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 8. BESPOKE BRIDAL & SAGAI BANNER */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative max-w-[1520px] mx-auto my-8 sm:my-12 overflow-hidden bg-[#EAEAE8] border border-gray-200/80 p-3 sm:p-8 lg:p-14 min-h-[380px] sm:min-h-[480px] flex items-center justify-end"
      >
        {/* Background Studio Image with Pedestal, Standing Ring, and White Vase */}
        <div className="absolute inset-0 z-0">
          <img
            src={FRAMER_IMAGES.weddingBanner}
            alt="Monika Jewellers Sagai Atelier Studio"
            className="w-full h-full object-cover object-left"
          />
        </div>

        {/* Right Floating White Card with Inner Gold Border Frame */}
        <div className="relative z-10 w-full md:w-[480px] lg:w-[520px] bg-white p-3 sm:p-6 text-center shadow-lg border border-gray-100">
          <div className="border border-[#C5A572]/60 p-5 sm:p-8 lg:p-10 flex flex-col items-center justify-center">
            <span className="font-body text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-[#B59A6C] mb-2 sm:mb-3 block">
              THE SACRED VOWS • SAGAI & MANGALSUTRA
            </span>
            <h2 className="font-body text-xl sm:text-2xl lg:text-3xl text-[#222222] font-bold mb-2 sm:mb-3 tracking-tight">
              Bespoke Bridal Trousseau
            </h2>
            <p className="font-body text-[#777777] text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 max-w-xs mx-auto">
              Auspicious solitaire engagement rings, hand-threaded mangalsutras, and heirloom polki ornaments tailored to your family traditions.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}>
              <Link
                to="/store-grid/rings"
                className="inline-block bg-[#B59A6C] hover:bg-[#A38B5F] text-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-bold uppercase tracking-[0.25em] transition-all rounded-none shadow-sm"
              >
                EXPLORE SAGAI COLLECTION
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 9. PATRON STORIES & TESTIMONIALS */}
      <section className="py-12 sm:py-16 max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 bg-[#FAF9F7]/60 border-y border-gray-100">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-12">
          <span className="font-body text-[11px] sm:text-xs text-[#B59A6C] tracking-[0.25em] uppercase font-bold block mb-2">
            VOICES OF FAMILY & TRUST
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl text-[#222222] font-bold uppercase tracking-wider">
            Patron Chronicles
          </h2>
          <p className="font-body text-gray-500 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
            Cherished reflections from brides, families, and lifelong patrons celebrating life&apos;s sacred milestones with Monika Jewellers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {patronStories.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 sm:p-8 rounded-[16px] border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#B59A6C] text-xs font-bold uppercase tracking-widest mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B59A6C]" />
                  <span>Verified Patron Story</span>
                </div>
                <p className="font-body text-xs sm:text-sm text-gray-700 italic leading-relaxed mb-6">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-body text-sm font-bold text-[#222222]">{story.patron}</h4>
                <p className="font-body text-[11px] text-gray-400 mt-0.5">{story.city} &bull; <span className="text-[#B59A6C]">{story.occasion}</span></p>
                <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{story.item}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 10. QUESTIONS / FAQ ACCORDION */}
      <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="font-body text-[11px] sm:text-xs text-[#B59A6C] tracking-[0.25em] uppercase font-bold block mb-2">
            AUTHENTICITY & ASSURANCE
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl uppercase tracking-wider text-[#222222] font-bold">Frequently Answered Questions</h2>
          <p className="font-body text-gray-500 text-xs sm:text-sm mt-2">
            Clear, transparent answers regarding BIS 916 hallmarks, HUID laser codes, live IBJA pricing, and custom atelier orders.
          </p>
        </motion.div>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: index * 0.04 }}
              className="border border-gray-200/80 rounded-[12px] bg-white overflow-hidden transition-colors hover:border-[#B59A6C]/40"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-4 sm:p-5 text-left focus:outline-none"
              >
                <span className="font-body text-[#222222] text-sm sm:text-base font-semibold">{faq.q}</span>
                <span className="text-[#B59A6C] text-xl ml-4 font-light flex-shrink-0">{openFaq === index ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-body text-gray-600 text-xs sm:text-sm px-4 sm:px-5 pb-5 pr-8 leading-relaxed border-t border-gray-50 pt-3">
                      {faq.a}
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
