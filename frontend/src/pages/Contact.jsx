import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('support');
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactMethods = [
    {
      id: 'support',
      title: 'CUSTOMER CONCIERGE',
      subtitle: 'Personalized Assistance & Inquiries',
      phone: '+91 (022) 8800-4499',
      email: 'concierge@glimmr.com',
      hours: 'Mon - Sat: 10:00 AM - 8:00 PM IST',
    },
    {
      id: 'showroom',
      title: 'FLAGSHIP ATELIER SHOWROOM',
      subtitle: 'Private VIP Appointments & Viewing',
      address: 'Suite 402, Royal Heritage Tower, Bandra Kurla Complex',
      city: 'Mumbai, Maharashtra 400051, India',
      hours: 'Tue - Sun: 11:00 AM - 7:00 PM IST',
    },
    {
      id: 'bespoke',
      title: 'BESPOKE & ENGAGEMENT',
      subtitle: 'Custom Bridal & Heirloom Design',
      phone: '+91 (022) 8800-4500',
      email: 'bespoke@glimmr.com',
      hours: 'By Private Appointment Only',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-body">
      {/* Webflow-Style Luxury Hero Section */}
      <section className="bg-[#FAF9F7] py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-100 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="max-w-[1200px] mx-auto text-center relative z-10"
        >
          <span className="font-body text-xs font-semibold uppercase tracking-[0.35em] text-[#B59A6C] mb-4 block">
            WE WOULD LOVE TO HEAR FROM YOU
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl text-[#222222] uppercase tracking-[0.2em] font-normal leading-tight max-w-4xl mx-auto">
            Connect With Our Atelier
          </h1>
          <p className="font-body text-[#808080] text-sm sm:text-base mt-6 max-w-2xl mx-auto leading-relaxed font-normal">
            Whether inquiring about bespoke bridal customization, visiting our flagship showroom, or scheduling a private viewing, our concierge is at your service.
          </p>
        </motion.div>
      </section>

      {/* Main Grid: Form + Native High-Res Showroom Photography */}
      <section className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left: Webflow Interactive Form Component */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 bg-white p-8 sm:p-12 border border-gray-200/70 shadow-[0_15px_45px_rgba(0,0,0,0.04)]"
          >
            <div className="mb-8">
              <span className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-[#B59A6C] block mb-2">
                DIRECT INQUIRY
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl text-[#222222] uppercase tracking-[0.15em] font-normal">
                Send a Message
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="bg-[#FAF9F7] border border-gray-200 p-12 text-center py-20"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 bg-[#B59A6C] text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-6 shadow-md"
                  >
                    ✓
                  </motion.div>
                  <h3 className="font-heading text-2xl uppercase tracking-[0.2em] text-[#222222] mb-3">
                    Message Received
                  </h3>
                  <p className="font-body text-[#808080] text-sm max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to Glimmr. Our dedicated luxury concierge team will respond to your inquiry within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-body text-xs font-semibold text-[#222222] uppercase tracking-[0.15em] mb-2">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Ananya Sharma"
                        className="w-full px-4 py-3.5 bg-[#FAF9F7] border border-gray-200 text-[#222222] font-body text-sm focus:outline-none focus:border-[#B59A6C] focus:bg-white transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block font-body text-xs font-semibold text-[#222222] uppercase tracking-[0.15em] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="e.g. ananya@example.com"
                        className="w-full px-4 py-3.5 bg-[#FAF9F7] border border-gray-200 text-[#222222] font-body text-sm focus:outline-none focus:border-[#B59A6C] focus:bg-white transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block font-body text-xs font-semibold text-[#222222] uppercase tracking-[0.15em] mb-2">
                      Inquiry Category *
                    </label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-[#FAF9F7] border border-gray-200 text-[#222222] font-body text-sm text-left focus:outline-none transition-all duration-300"
                    >
                      <span>{formData.subject || 'Select Inquired Department'}</span>
                      <svg className={`w-4 h-4 transition-transform duration-300 ${isDeptMenuOpen ? 'rotate-180 text-[#222222]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>

                    <AnimatePresence>
                      {isDeptMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-50 py-1"
                        >
                          {[
                            { value: 'Bespoke Design', label: 'Bespoke Jewelry Customization' },
                            { value: 'Showroom Appointment', label: 'Flagship Showroom Appointment' },
                            { value: 'Order Status', label: 'Existing Order & Care Concierge' },
                            { value: 'General Inquiry', label: 'General Atelier Inquiry' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, subject: opt.value });
                                setIsDeptMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-xs font-body tracking-wider uppercase hover:bg-[#FAF9F7] transition-colors ${formData.subject === opt.value ? 'font-bold text-[#222222] bg-gray-50' : 'text-gray-600'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block font-body text-xs font-semibold text-[#222222] uppercase tracking-[0.15em] mb-2">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      placeholder="Please share details about your inquiry or desired appointment time..."
                      className="w-full px-4 py-3.5 bg-[#FAF9F7] border border-gray-200 text-[#222222] font-body text-sm focus:outline-none focus:border-[#B59A6C] focus:bg-white transition-all duration-300 resize-none"
                    ></textarea>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-[#222222] text-white py-4 uppercase tracking-[0.25em] text-xs font-bold hover:bg-[#B59A6C] transition-colors duration-300 shadow-md"
                  >
                    SUBMIT INQUIRY
                  </motion.button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: Crisp 1:1 Native Pixel Framer CDN Photography Container */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex flex-col items-center justify-start space-y-8"
          >
            <div className="w-full max-w-[430px] aspect-[430/645] bg-[#FAF9F7] overflow-hidden relative shadow-[0_25px_60px_rgba(0,0,0,0.09)] border border-gray-200/60 group mx-auto">
              <img
                src="https://framerusercontent.com/images/kbOrsOMF8pMkMH6SntJTPO88bQ.png"
                alt="Glimmr Flagship Atelier Showroom"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 text-white text-left">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-1">
                  MUMBAI ATELIER SHOWROOM
                </span>
                <h4 className="font-heading text-lg uppercase tracking-wider font-normal">
                  Private VIP Appointments
                </h4>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Glassmorphic Contact Method Cards Grid */}
      <section className="py-20 bg-[#FAF9F7] border-t border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-[#B59A6C] block mb-3">
              DIRECT CHANNELS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-[0.2em] text-[#222222] font-normal">
              Atelier Contacts
            </h2>
            <div className="w-16 h-[2px] bg-[#B59A6C] mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, idx) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white p-8 border border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.25em] text-[#B59A6C] block mb-2">
                    {method.subtitle}
                  </span>
                  <h3 className="font-heading text-lg uppercase tracking-[0.15em] text-[#222222] mb-4 group-hover:text-[#B59A6C] transition-colors">
                    {method.title}
                  </h3>

                  {method.phone && (
                    <p className="font-body text-[#222222] text-sm font-semibold mb-1">
                      {method.phone}
                    </p>
                  )}
                  {method.email && (
                    <p className="font-body text-[#808080] text-sm mb-4">
                      {method.email}
                    </p>
                  )}
                  {method.address && (
                    <p className="font-body text-[#808080] text-sm leading-relaxed mb-4">
                      {method.address}<br />{method.city}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 text-xs font-body text-[#808080]">
                  {method.hours}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Webflow Newsletter VIP Banner */}
      <section className="bg-[#222222] py-20 text-white text-center px-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto flex flex-col items-center relative z-10"
        >
          <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-[#B59A6C] mb-3">
            JOIN THE GLIMMR SOCIAL CLUB
          </span>
          <h3 className="font-heading text-3xl sm:text-4xl uppercase tracking-[0.2em] mb-4 font-normal">
            Private VIP Invitations
          </h3>
          <p className="font-body text-gray-400 text-sm mb-8 leading-relaxed">
            Subscribe to receive private previews of new high-jewelry collections, bespoke trunk show invitations, and luxury updates.
          </p>

          <form className="w-full max-w-md flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address..."
              required
              className="flex-1 px-6 py-3.5 bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs font-body focus:outline-none focus:border-[#B59A6C] transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="bg-[#B59A6C] text-white px-8 py-3.5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-white hover:text-[#222222] transition-colors duration-300"
            >
              SUBSCRIBE
            </motion.button>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default Contact;
