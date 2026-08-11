import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  LockIcon, 
  WalletIcon, 
  GlobeIcon, 
  CheckCircleIcon, 
  SparklesIcon, 
  UsersIcon, 
  MailIcon 
} from '../components/Icons';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('data-collection');
  const [openAccordion, setOpenAccordion] = useState(null);

  const sections = [
    {
      id: 'data-collection',
      title: '1. Client Data Collection',
      icon: UsersIcon,
      subtitle: 'Information collected to deliver Haute Joaillerie experiences.',
      content: `At Glimmr Atelier, we collect personal information strictly necessary to curate bespoke fine jewelry portfolios, facilitate secure transactions, and fulfill insured shipments.

We collect:
• Personal Identifiers: Full legal name, billing and white-glove delivery addresses, phone number, and email address.
• Portfolio Preferences: Saved ring sizes, preferred metal purities (24K Gold, 925 Silver), wishlist items, and custom engraving requests.
• Transaction References: Order IDs, GST invoice records, and shipping destination credentials.

We never sell, rent, or trade your personal data to third-party marketers.`
    },
    {
      id: 'encryption-security',
      title: '2. Atelier Data Encryption',
      icon: LockIcon,
      subtitle: 'Military-grade 256-bit SSL encryption & vault protection.',
      content: `Your privacy is safeguarded under international encryption standards. All communication between your device and Glimmr Atelier servers is encrypted via 256-bit Secure Sockets Layer (SSL) technology.

• Encrypted Vaults: Customer profile data and delivery destinations are stored in isolated, access-controlled database clusters.
• Multi-Factor Safeguards: Internal access to order portfolios is limited to authorized Atelier white-glove concierges under strict non-disclosure agreements.`
    },
    {
      id: 'financial-privacy',
      title: '3. Financial & Payment Privacy',
      icon: WalletIcon,
      subtitle: 'Zero raw card storage. PCI-DSS Level 1 payment processing.',
      content: `Glimmr Atelier never stores full credit card numbers, debit card PINs, or UPI credentials on local servers. 

All financial transactions are tokenized and processed through PCI-DSS Level 1 compliant gateways (Stripe & Razorpay). Payment tokens are encrypted end-to-end, guaranteeing that financial data remains confidential.`
    },
    {
      id: 'cookies-analytics',
      title: '4. Cookies & Personalization',
      icon: SparklesIcon,
      subtitle: 'Essential session cookies to maintain your shopping portfolio.',
      content: `We use cookies and local browser storage exclusively to enhance your navigation experience:

• Essential Cookies: Maintain your active cart session, authentication tokens, and currency preferences.
• Analytical Performance: Anonymous metrics to optimize page load speeds and inventory availability.

You may disable non-essential cookies via your browser settings at any time.`
    },
    {
      id: 'logistics-fulfillment',
      title: '5. Insured Transit & Third-Party Logistics',
      icon: GlobeIcon,
      subtitle: 'Discreet packaging with insured white-glove courier partners.',
      content: `To ensure your fine jewelry reaches you safely, we share limited shipping details (Name, Delivery Address, Contact Number) strictly with our certified insured courier partners (Blue Dart Apex / Sequel Logistics).

All shipments are packaged in unbranded outer tamper-evident security boxes to preserve privacy and prevent transit theft.`
    },
    {
      id: 'digital-rights',
      title: '6. Your Digital Privacy Rights',
      icon: ShieldCheckIcon,
      subtitle: 'Full ownership and control over your Atelier personal record.',
      content: `Under the Digital Personal Data Protection (DPDP) Act and international privacy frameworks, you retain complete authority over your personal information:

• Right to Access: Request a digital export of all personal data held by Glimmr Atelier.
• Right to Rectification: Update or correct inaccurate shipping addresses or profile records.
• Right to Erasure: Request permanent deletion of your Atelier profile and historical record (except tax invoice records required under Indian GST law).`
    }
  ];

  const faqs = [
    {
      q: 'How long is my GST Tax Invoice data retained?',
      a: 'Under Indian GST tax regulations, sales tax invoice records are securely retained for a minimum of 7 fiscal years. Profile credentials can be deleted upon request.'
    },
    {
      q: 'Does Glimmr Atelier share client records with external ad networks?',
      a: 'Never. We strictly prohibit selling or sharing client identity or purchase portfolios with third-party advertising exchanges.'
    },
    {
      q: 'How can I exercise my right to data deletion?',
      a: 'You can request account erasure directly from your Profile Settings tab or by contacting privacy@glimmr.com.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#111111] font-body selection:bg-[#B59A6C]/20">
      
      {/* Luxury Hero Banner */}
      <section className="relative bg-[#111111] text-[#FAF9F7] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#B59A6C]/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B59A6C_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FDF2F0] border border-[#E8C8C1] rounded-none mb-6"
          >
            <ShieldCheckIcon size={16} className="text-[#B59A6C]" />
            <span className="text-xs font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C]">
              CLIENT PRIVACY GUARANTEE
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase mb-4"
          >
            PRIVACY POLICY & TRUST
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Transparent data governance, 256-bit SSL encryption, and white-glove confidentiality for every Glimmr Atelier patron.
          </motion.p>

          <div className="mt-6 flex justify-center items-center gap-4 text-xs text-gray-500 font-mono">
            <span>Effective: January 2026</span>
            <span>•</span>
            <span>DPDP Act 2023 Compliant</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Sticky Navigation Menu */}
          <div className="lg:col-span-4 sticky top-28 bg-white border border-[#E5E2D9] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-3">
            <span className="text-[10px] font-body font-bold uppercase tracking-widest text-[#B59A6C] block mb-2">
              TABLE OF CONTENTS
            </span>
            {sections.map((sec) => {
              const IconComp = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-full text-left p-3 transition-all flex items-center justify-between text-xs font-body font-bold uppercase tracking-wider cursor-pointer border ${
                    isActive 
                      ? 'bg-[#111111] text-[#FAF9F7] border-[#111111]' 
                      : 'bg-[#FAF9F7] text-gray-700 border-transparent hover:border-[#E5E2D9] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp size={16} className={isActive ? 'text-[#B59A6C]' : 'text-gray-400'} />
                    <span className="truncate">{sec.title.split('. ')[1]}</span>
                  </div>
                  <span className="text-[10px] opacity-60">→</span>
                </button>
              );
            })}
          </div>

          {/* Right Policy Articles */}
          <div className="lg:col-span-8 space-y-10">
            {sections.map((sec, idx) => {
              const IconComp = sec.icon;
              return (
                <motion.div
                  key={sec.id}
                  id={sec.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="bg-white border border-[#E5E2D9] p-8 sm:p-10 shadow-[0_15px_35px_rgba(0,0,0,0.03)] space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FDF2F0] border border-[#E8C8C1] flex items-center justify-center text-[#B59A6C] shrink-0">
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h2 className="font-heading font-extrabold text-xl text-[#111111] uppercase tracking-wide">
                        {sec.title}
                      </h2>
                      <p className="text-xs font-body text-[#B59A6C] font-semibold tracking-wider mt-0.5">
                        {sec.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 text-sm font-body text-gray-600 leading-relaxed whitespace-pre-line space-y-2">
                    {sec.content}
                  </div>
                </motion.div>
              );
            })}

            {/* Accordion FAQs */}
            <div className="bg-white border border-[#E5E2D9] p-8 sm:p-10 shadow-[0_15px_35px_rgba(0,0,0,0.03)] space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircleIcon size={20} className="text-emerald-600" />
                <h3 className="font-heading font-extrabold text-lg text-[#111111] uppercase tracking-wide">
                  FREQUENTLY ASKED PRIVACY QUESTIONS
                </h3>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, fIdx) => (
                  <div key={fIdx} className="border border-gray-200 bg-[#FAF9F7]">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === fIdx ? null : fIdx)}
                      className="w-full p-4 text-left flex justify-between items-center text-xs font-body font-bold text-[#111111] uppercase tracking-wider cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-base font-mono">{openAccordion === fIdx ? '−' : '+'}</span>
                    </button>
                    {openAccordion === fIdx && (
                      <div className="p-4 pt-0 text-xs font-body text-gray-600 border-t border-gray-200/60 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact DPO Card */}
            <div className="bg-[#111111] text-[#FAF9F7] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t-2 border-[#B59A6C]">
              <div>
                <h4 className="font-heading font-bold text-lg uppercase tracking-wider text-white">
                  Data Protection Officer (DPO)
                </h4>
                <p className="text-xs font-body text-gray-400 mt-1">
                  Have questions about your personal data or DPDP compliance? Speak directly to our privacy team.
                </p>
              </div>

              <Link
                to="/contact"
                className="px-6 py-3 bg-[#FAF9F7] text-[#111111] text-xs font-body font-bold uppercase tracking-[0.2em] hover:bg-[#B59A6C] hover:text-white transition-colors shrink-0 flex items-center gap-2"
              >
                <MailIcon size={14} />
                <span>Contact DPO</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

export default PrivacyPolicy;
