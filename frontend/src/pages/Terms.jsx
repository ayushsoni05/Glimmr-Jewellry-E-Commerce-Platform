import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, SparklesIcon, CheckCircleIcon, ArrowRightIcon } from '../components/Icons';

const Terms = () => {
  const sections = [
    {
      title: '1. Acceptance of Atelier Purchasing Terms',
      content: 'By accessing, browsing, or purchasing from Glimmr Atelier, you accept and agree to be bound by these terms, conditions, and notices. Every transaction represents a binding contract for haute joaillerie craftsmanship.',
    },
    {
      title: '2. Fine Jewelry Valuation & Metal Purity Guarantee',
      content: 'All precious gold (24K, 22K, 18K, 14K) and sterling silver (925 purity) pieces offered by Glimmr Atelier are 100% BIS Hallmarked. Metal weights, gemstone carat weights, and market pricing are transparently declared on your GST Tax Invoice.',
    },
    {
      title: '3. Privacy & Client Data Protection',
      content: 'Your privacy and transaction records are safeguarded under 256-bit SSL encryption and international data governance laws. For full details on how we store, protect, and handle your data, please review our official Privacy Policy.',
      hasPrivacyLink: true
    },
    {
      title: '4. Intellectual Property & Atelier Craftsmanship',
      content: 'All bespoke designs, CAD renders, high-resolution imagery, logo trademarks, and editorial copy displayed on Glimmr Atelier are exclusive proprietary property. Unauthorized reproduction or commercial distribution is strictly prohibited.',
    },
    {
      title: '5. White-Glove Insured Delivery & Liability',
      content: 'All shipments leave our atelier in tamper-evident security packaging under 100% transit insurance. Once signed for by the designated recipient, ownership transfers to the client.',
    },
    {
      title: '6. Modification of Terms',
      content: 'Glimmr Atelier reserves the right to revise or update these terms at any time. Continued use of the platform following published changes constitutes full acceptance.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] font-body selection:bg-[#B59A6C]/20">
      
      {/* Hero Section */}
      <section className="relative bg-[#111111] text-[#FAF9F7] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#B59A6C]/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B59A6C_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FDF2F0] border border-[#E8C8C1] rounded-none mb-6"
          >
            <ShieldCheckIcon size={16} className="text-[#B59A6C]" />
            <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C]">
              LEGAL TERMS & GOVERNANCE
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase mb-4"
          >
            TERMS & CONDITIONS
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Official purchasing guidelines, BIS hallmarking guarantees, and client service agreements for Glimmr Atelier.
          </motion.p>
        </div>
      </section>

      {/* Main Content Articles */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {sections.map((sec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white border border-[#E5E2D9] p-8 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4"
            >
              <h2 className="font-heading font-extrabold text-xl text-[#111111] uppercase tracking-wide">
                {sec.title}
              </h2>
              <p className="text-sm font-body text-gray-600 leading-relaxed">
                {sec.content}
              </p>

              {sec.hasPrivacyLink && (
                <div className="pt-3">
                  <Link
                    to="/privacy-policy"
                    className="inline-flex items-center gap-2 text-xs font-body font-bold text-[#B59A6C] uppercase tracking-widest hover:underline"
                  >
                    <span>Read Full Privacy Policy & Data Guarantee</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Terms;
