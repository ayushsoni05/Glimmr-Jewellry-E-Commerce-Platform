import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

const AboutUs = () => {
  const companyValues = [
    {
      title: 'Excellence',
      tagline: 'OUR UNWAVERING COMMITMENT TO PERFECTION',
      description: 'We are committed to the relentless pursuit of excellence in everything we do. From the intricate hand-craftsmanship of our gold and silver jewelry to the white-glove service we provide, we strive for absolute perfection, knowing that excellence is the foundation of enduring beauty.',
      image: 'https://framerusercontent.com/images/DdMSTOefO0YEho190OisMkszb8.png?width=1200',
    },
    {
      title: 'Integrity',
      tagline: 'TRANSPARENCY & ETHICAL STANDARDS',
      description: 'Integrity is the cornerstone of our atelier. We operate with complete transparency, honesty, and fairness in all our interactions—with our customers, artisans, and global partners. Certified BIS hallmarking and 100% genuine purity guarantees are the bedrock of our trust.',
      image: 'https://framerusercontent.com/images/VUCxKLRtAXtB7J9fhWKrMpxLg.png?width=1200',
    },
    {
      title: 'Artistry',
      tagline: 'CELEBRATING HERITAGE FINE JEWELRY',
      description: 'We celebrate the deep artistry of fine Indian jewelry. Our creations are not just accessories; they are living works of art that embody centuries of Kundan, Nakshi, and filigree heritage. We believe that every piece should tell a unique, immortal story.',
      image: 'https://framerusercontent.com/images/nYmBPU9wzxN2XzOy4Mors5JiA.png?width=1200',
    },
    {
      title: 'Customer-Centric',
      tagline: 'YOUR MILESTONES ARE OUR PASSION',
      description: 'Our customers are at the heart of everything we craft. We listen to your desires, understand your milestones, and strive to exceed your expectations. Your satisfaction and emotional connection to our pieces are our ultimate inspiration.',
      image: 'https://framerusercontent.com/images/ye7CD1FwMK23YrmwGKBxPmwkxs.png?width=1200',
    },
    {
      title: 'Ethical Sourcing',
      tagline: 'SUSTAINABLE & RESPONSIBLE MATERIALS',
      description: 'We are committed to responsible and ethical sourcing of gold, fine silver, and gemstones. Our dedication to sustainability ensures that our jewelry not only reflects breathtaking beauty but also profound respect for our planet and its communities.',
      image: 'https://framerusercontent.com/images/J7D8037iOHxzeluZMHv3T7v8.png?width=1200',
    },
    {
      title: 'Personalization',
      tagline: 'BESPOKE TAILORED HEIRLOOMS',
      description: 'We understand that jewelry is deeply personal. We embrace custom engraving and bespoke artisan tailoring, allowing you to co-create heirlooms that reflect your unique individuality and commemorate life\'s most cherished occasions.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=95',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section with Interactive WebGL Canvas Sparkle Background */}
      <section className="relative bg-[#FAF9F7] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-gray-100">
        <SparkleCanvas />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="max-w-[1200px] mx-auto text-center relative z-10"
        >
          <span className="font-body text-xs font-semibold uppercase tracking-[0.35em] text-[#B59A6C] mb-4 block">
            ABOUT GLIMMR LUXURY ATELIER
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-[#222222] uppercase tracking-[0.2em] font-normal leading-tight max-w-5xl mx-auto">
            Craftsmanship Meets Timeless Elegance
          </h1>
          <p className="font-body text-[#808080] text-sm sm:text-base mt-6 max-w-2xl mx-auto leading-relaxed font-normal">
            We are not just a jewelry brand; we are the storytellers of your most cherished moments, the keepers of your milestones, and the creators of enduring beauty. Welcome to Glimmr.
          </p>
        </motion.div>
      </section>

      {/* Main Feature Showcase Grid with Uncompressed Framer CDN High-Res Images */}
      <section className="py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 order-2 lg:order-1 space-y-6 font-body text-[#808080] text-sm sm:text-base leading-relaxed"
          >
            <span className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-[#B59A6C] block">
              OUR HERITAGE & JOURNEY
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl text-[#222222] uppercase tracking-[0.15em] font-normal">
              A Tale of Relentless Passion & Artistry
            </h2>
            <p>
              The journey of Glimmr is a tale of relentless passion and unwavering dedication. It began with a vision—a vision to redefine luxury, to make it more than just a material possession, but a tangible expression of the heart's deepest emotions.
            </p>
            <p>
              Founded by a team of master artisans, designers, and visionaries, Glimmr came to life as a response to the impersonal nature of mass-produced jewelry. We recognized the need for jewelry that tells a story, carrying your memories and milestones across generations.
            </p>
            <p>
              Today, as we look back on our journey, we remain humbled by the trust placed in our atelier. We continue to explore new horizons, crafting pieces that weave together love, art, and timeless grace.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 order-1 lg:order-2 flex justify-center"
          >
            <div className="w-full max-w-[430px] aspect-[430/645] bg-[#FAF9F7] overflow-hidden relative shadow-[0_25px_60px_rgba(0,0,0,0.09)] border border-gray-200/60 group mx-auto">
              <img
                src="https://framerusercontent.com/images/kbOrsOMF8pMkMH6SntJTPO88bQ.png"
                alt="Glimmr Fine Jewelry Atelier"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>

        {/* Second Feature Showcase Section with Uncompressed Image 2 */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex justify-center"
          >
            <div className="w-full max-w-[430px] aspect-[430/645] bg-[#FAF9F7] overflow-hidden relative shadow-[0_25px_60px_rgba(0,0,0,0.09)] border border-gray-200/60 group mx-auto">
              <img
                src="https://framerusercontent.com/images/lwWSRpm9ihnLqpWiEKW3NXpyJU.png"
                alt="Timeless Craftsmanship"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6 font-body text-[#808080] text-sm sm:text-base leading-relaxed"
          >
            <span className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-[#B59A6C] block">
              UNCOMPROMISING CRAFTSMANSHIP
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl text-[#222222] uppercase tracking-[0.15em] font-normal">
              Every Creation is a Masterpiece
            </h2>
            <p>
              At Glimmr, craftsmanship is an art form. We believe that every piece of jewelry should be a masterpiece, meticulously crafted to stand the test of time and capture the essence of its wearer.
            </p>
            <p>
              <strong className="text-[#222222]">The Artisans:</strong> Our artisans are the true guardians of our craft. With years of experience and a profound passion for their work, they bring each design to life with precision and artistry.
            </p>
            <p>
              <strong className="text-[#222222]">Uncompromising Quality:</strong> We source ethically certified diamonds, 24K/22K/18K gold, and fine sterling silver, ensuring that every component meets the highest global standards.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Values Section - Editorial Alternating Feature Layout Matching Above */}
      <section className="py-24 bg-[#FAF9F7] border-t border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-[#B59A6C] block mb-3">
              OUR GUIDING PRINCIPLES
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl uppercase tracking-[0.2em] text-[#222222] font-normal">
              Company Values
            </h2>
            <div className="w-16 h-[2px] bg-[#B59A6C] mx-auto mt-6" />
          </motion.div>

          <div className="space-y-24">
            {companyValues.map((val, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div key={val.title} className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className={`lg:col-span-6 ${isEven ? 'order-2 lg:order-1' : 'order-2 lg:order-2'} space-y-6 font-body text-[#808080] text-sm sm:text-base leading-relaxed`}
                  >
                    <span className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-[#B59A6C] block">
                      {val.tagline}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-4xl text-[#222222] uppercase tracking-[0.15em] font-normal">
                      {val.title}
                    </h3>
                    <p className="text-[#808080] leading-relaxed">
                      {val.description}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className={`lg:col-span-6 ${isEven ? 'order-1 lg:order-2' : 'order-1 lg:order-1'} flex justify-center`}
                  >
                    <div className="w-full max-w-[430px] aspect-[430/645] bg-white overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-200/60 group mx-auto">
                      <img
                        src={val.image}
                        alt={val.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
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
            START YOUR CUSTOM JOURNEY
          </span>
          <h3 className="font-heading text-3xl sm:text-5xl uppercase tracking-[0.2em] mb-8 font-normal">
            Let's Work With Us
          </h3>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/contact"
              className="inline-block bg-[#FAF9F7] text-[#222222] border border-white px-8 py-4 uppercase tracking-[0.25em] text-xs font-semibold hover:bg-black hover:text-white hover:border-black transition-all shadow-lg"
            >
              CONTACT OUR ATELIER
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutUs;
