import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, LockIcon, WalletIcon, GlobeIcon, SparklesIcon, UsersIcon } from '../components/Icons';

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
    const particleCount = 50;
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

const ClientPrivacy = () => {
  const [activeSection, setActiveSection] = useState('data-collection');

  const privacySections = [
    {
      id: 'data-collection',
      number: '01',
      title: 'Client Data Collection',
      tagline: 'COLLECTING PATRON IDENTIFIERS WITH UTMOST CARE',
      icon: UsersIcon,
      paragraphs: [
        'At Glimmr Atelier, we collect personal information strictly necessary to curate bespoke fine jewelry portfolios, facilitate secure transactions, and fulfill insured shipments.',
        'We collect personal identifiers such as your full legal name, billing address, white-glove delivery address, contact phone number, and email address. We also record portfolio preferences including ring sizes, preferred metal purities (24K Gold, 925 Silver), and custom engraving specifications.',
        'We operate under strict confidentiality. Glimmr Atelier never sells, rents, or trades your personal data to third-party advertising networks.'
      ],
      image: 'https://framerusercontent.com/images/DdMSTOefO0YEho190OisMkszb8.png?width=1200',
    },
    {
      id: 'encryption-security',
      number: '02',
      title: 'Atelier Data Encryption',
      tagline: '256-BIT SSL ENCRYPTION & SECURE VAULT PROTECTION',
      icon: LockIcon,
      paragraphs: [
        'Your digital privacy is safeguarded under international banking-grade encryption standards. All communications between your device and Glimmr Atelier servers are encrypted via 256-bit Secure Sockets Layer (SSL) technology.',
        'Customer profile credentials and shipping destinations reside within isolated, access-controlled cloud database clusters protected by multi-factor authentication.',
        'Internal access to customer records is restricted exclusively to authorized Atelier concierges under non-disclosure agreements.'
      ],
      image: 'https://framerusercontent.com/images/VUCxKLRtAXtB7J9fhWKrMpxLg.png?width=1200',
    },
    {
      id: 'financial-privacy',
      number: '03',
      title: 'Financial & Payment Confidentiality',
      tagline: 'PCI-DSS LEVEL 1 TOKENIZED PAYMENT PROCESSING',
      icon: WalletIcon,
      paragraphs: [
        'Glimmr Atelier never stores credit card numbers, debit card PINs, or raw banking credentials on local servers. Financial privacy is absolute.',
        'All online payments are tokenized and processed through PCI-DSS Level 1 compliant gateways (Stripe & Razorpay). Encrypted transaction tokens guarantee complete confidentiality during payment settlement.',
        'Official GST sales tax invoices are generated upon order completion and stored securely to comply with Indian tax regulations.'
      ],
      image: 'https://framerusercontent.com/images/nYmBPU9wzxN2XzOy4Mors5JiA.png?width=1200',
    },
    {
      id: 'cookies-analytics',
      number: '04',
      title: 'Cookies & Personalization',
      tagline: 'ESSENTIAL SESSION COOKIES FOR YOUR SHOPPING PORTFOLIO',
      icon: SparklesIcon,
      paragraphs: [
        'We utilize browser local storage and essential cookies exclusively to maintain your active shopping bag, wishlist items, and session authentication tokens.',
        'Anonymous analytical metrics are used solely to monitor page load speeds, optimize server performance, and maintain inventory availability.',
        'You retain full authority to manage or disable non-essential cookies through your web browser preferences at any time.'
      ],
      image: 'https://framerusercontent.com/images/ye7CD1FwMK23YrmwGKBxPmwkxs.png?width=1200',
    },
    {
      id: 'transit-logistics',
      number: '05',
      title: 'Insured Transit & Discreet Packaging',
      tagline: 'WHITE-GLOVE COURIER PARTNERSHIPS & SECURE PACKAGING',
      icon: GlobeIcon,
      paragraphs: [
        'To guarantee that your precious gold and silver jewelry arrives safely, we share necessary shipping details (Name, Delivery Address, Contact Number) strictly with certified insured couriers (Blue Dart Apex / Sequel Logistics).',
        'All shipments depart our atelier in unbranded, tamper-evident security boxes designed to maintain absolute privacy and prevent transit interception.',
        'Every parcel is 100% insured until signed for by the authorized recipient.'
      ],
      image: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png?width=1200',
    },
    {
      id: 'digital-rights',
      number: '06',
      title: 'Your Digital Rights & Governance',
      tagline: 'DPDP ACT COMPLIANCE & FULL DATA ACCESS CONTROL',
      icon: ShieldCheckIcon,
      paragraphs: [
        'Under the Digital Personal Data Protection (DPDP) Act 2023 and global privacy frameworks, you hold complete ownership over your personal data.',
        'You have the right to request a digital export of your stored personal record, correct inaccurate address credentials, or request permanent account erasure.',
        'For data requests or privacy inquiries, our Data Protection Officer (DPO) is available 24/7 at privacy@glimmr.com.'
      ],
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=95',
    },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white font-body selection:bg-[#B59A6C]/20">
      
      {/* Hero Header Section with Interactive Sparkle Canvas */}
      <section className="relative bg-[#FAF9F7] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-gray-100">
        <SparkleCanvas />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="max-w-[1200px] mx-auto text-center relative z-10"
        >
          <span className="font-body text-xs font-semibold uppercase tracking-[0.35em] text-[#B59A6C] mb-4 block">
            PRIVACY POLICY & CLIENT GUARANTEE
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-[#222222] uppercase tracking-[0.2em] font-normal leading-tight max-w-5xl mx-auto">
            Transparent Governance & Trust
          </h1>
          <p className="font-body text-[#808080] text-sm sm:text-base mt-6 max-w-2xl mx-auto leading-relaxed font-normal">
            Your privacy is as precious as the fine jewelry we craft. Explore our complete client data protection principles, SSL encryption standards, and DPDP Act compliance.
          </p>
        </motion.div>
      </section>

      {/* Sticky Table of Contents Navigation Bar */}
      <div className="sticky top-0 z-40 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-gray-200/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          <span className="text-[11px] font-body font-bold uppercase tracking-[0.2em] text-[#B59A6C] shrink-0 mr-2">
            TABLE OF CONTENTS:
          </span>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {privacySections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`px-3.5 py-1.5 text-xs font-body uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
                    isActive
                      ? 'bg-[#222222] text-white border-[#222222] font-semibold'
                      : 'bg-white text-[#808080] border-gray-200 hover:text-[#222222] hover:border-[#B59A6C]'
                  }`}
                >
                  {sec.number}. {sec.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editorial Alternating Feature Sections matching AboutUs Layout */}
      <section className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
        {privacySections.map((sec, idx) => {
          const isEven = idx % 2 === 0;
          const IconComp = sec.icon;

          return (
            <div 
              key={sec.id} 
              id={sec.id}
              className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center pt-8 border-t border-gray-100 first:border-t-0 first:pt-0 scroll-mt-24"
            >
              {/* Text Column */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`lg:col-span-6 ${isEven ? 'order-2 lg:order-1' : 'order-2 lg:order-2'} space-y-6 font-body text-[#808080] text-sm sm:text-base leading-relaxed`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#FAF9F7] border border-[#B59A6C]/30 flex items-center justify-center text-[#B59A6C] shrink-0">
                    <IconComp size={18} />
                  </div>
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-[#B59A6C] block">
                    {sec.tagline}
                  </span>
                </div>

                <h2 className="font-heading text-2xl sm:text-4xl text-[#222222] uppercase tracking-[0.15em] font-normal">
                  {sec.number}. {sec.title}
                </h2>

                <div className="space-y-4">
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-[#808080] leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </motion.div>

              {/* Image Showcase Column */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`lg:col-span-6 ${isEven ? 'order-1 lg:order-2' : 'order-1 lg:order-1'} flex justify-center`}
              >
                <div className="w-full max-w-[430px] aspect-[430/645] bg-[#FAF9F7] overflow-hidden relative shadow-[0_25px_60px_rgba(0,0,0,0.09)] border border-gray-200/60 group mx-auto">
                  <img
                    src={sec.image}
                    alt={sec.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 border border-white/60">
                    <span className="font-heading text-xs uppercase tracking-widest text-[#222222] font-bold block">
                      GLIMMR TRUST GUARANTEE
                    </span>
                    <span className="font-body text-[11px] text-[#808080]">
                      Certified Data Governance & SSL Security
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </section>

      {/* Luxury Dark CTA Section */}
      <section className="bg-[#222222] py-24 text-white text-center px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto flex flex-col items-center relative z-10"
        >
          <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-[#B59A6C] mb-3">
            HAVE PRIVACY QUESTIONS?
          </span>
          <h3 className="font-heading text-3xl sm:text-5xl uppercase tracking-[0.2em] mb-8 font-normal">
            Speak to Our DPO
          </h3>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/contact"
              className="inline-block bg-[#FAF9F7] text-[#222222] border border-white px-8 py-4 uppercase tracking-[0.25em] text-xs font-semibold hover:bg-black hover:text-white hover:border-black transition-all shadow-lg"
            >
              CONTACT DATA PROTECTION OFFICER
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
};

export default ClientPrivacy;
