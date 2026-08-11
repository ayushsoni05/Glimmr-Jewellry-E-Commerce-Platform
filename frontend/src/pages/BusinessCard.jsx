import { useState } from 'react';
import { motion } from 'framer-motion';
import { DiamondIcon, StarIcon } from '../components/Icons';

const BusinessCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const cardVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.6, ease: 'easeInOut' },
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.6, ease: 'easeInOut' },
    },
  };

  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: {
      x: '200%',
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'linear',
      },
    },
  };

  const cardTemplates = [
    {
      id: 1,
      name: 'Golden Elegance',
      gradient: 'from-amber-50 via-amber-100 to-yellow-50',
      accentColor: 'text-amber-700',
      borderColor: 'border-amber-400',
      bgPattern: 'gold',
    },
    {
      id: 2,
      name: 'Diamond Luxury',
      gradient: 'from-slate-100 via-blue-50 to-slate-200',
      accentColor: 'text-slate-700',
      borderColor: 'border-blue-300',
      bgPattern: 'diamond',
    },
    {
      id: 3,
      name: 'Royal Silver',
      gradient: 'from-gray-100 via-slate-50 to-gray-200',
      accentColor: 'text-slate-800',
      borderColor: 'border-slate-400',
      bgPattern: 'silver',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12 px-4">
      {/* Floating diamonds decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-400 opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: Math.random() * 360 + 360,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
            }}
          >
            <DiamondIcon className="w-6 h-6" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <DiamondIcon className="w-16 h-16 text-amber-600 mx-auto" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent">
            Glimmrr Business Cards
          </h1>
          <p className="text-xl text-slate-600">
            Luxury jewelry-themed business cards with stunning 3D animations
          </p>
        </motion.div>

        {/* Main Interactive Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-20 flex justify-center"
        >
          <div className="perspective-1000 w-full max-w-2xl">
            <motion.div
              className="relative w-full cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                aspectRatio: '1.75',
              }}
              animate={isFlipped ? 'back' : 'front'}
              variants={cardVariants}
              onClick={() => setIsFlipped(!isFlipped)}
              whileHover={{ scale: 1.05 }}
            >
              {/* Front of Card */}
              <div
                className="absolute inset-0 backface-hidden rounded-none shadow-2xl overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className="relative h-full bg-black overflow-hidden">
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500"></div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center">
                    {/* Left side - Ornate Mandala Pattern */}
                    <div className="w-1/2 h-full flex items-center justify-center p-6 md:p-10">
                      <motion.div
                        className="relative"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 60,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        {/* Outer decorative ring */}
                        <svg className="w-48 h-48 md:w-64 md:h-64" viewBox="0 0 200 200">
                          {/* Outer circle with ornate pattern */}
                          <circle cx="100" cy="100" r="95" fill="none" stroke="#D97706" strokeWidth="1" opacity="0.6"/>
                          <circle cx="100" cy="100" r="85" fill="none" stroke="#F59E0B" strokeWidth="0.5" opacity="0.8"/>
                          
                          {/* Ornate petals/leaves pattern */}
                          {[...Array(12)].map((_, i) => {
                            const angle = (i * 30) * Math.PI / 180;
                            const x1 = 100 + 70 * Math.cos(angle);
                            const y1 = 100 + 70 * Math.sin(angle);
                            const x2 = 100 + 85 * Math.cos(angle);
                            const y2 = 100 + 85 * Math.sin(angle);
                            return (
                              <g key={i}>
                                {/* Petal shape */}
                                <path
                                  d={`M ${x1},${y1} Q ${100 + 90 * Math.cos(angle)},${100 + 90 * Math.sin(angle)} ${x2},${y2}`}
                                  fill="none"
                                  stroke="#F59E0B"
                                  strokeWidth="2"
                                  opacity="0.9"
                                />
                                {/* Decorative dots */}
                                <circle
                                  cx={100 + 78 * Math.cos(angle)}
                                  cy={100 + 78 * Math.sin(angle)}
                                  r="2"
                                  fill="#FCD34D"
                                />
                              </g>
                            );
                          })}
                          
                          {/* Middle decorative layer */}
                          {[...Array(8)].map((_, i) => {
                            const angle = (i * 45) * Math.PI / 180;
                            const x = 100 + 60 * Math.cos(angle);
                            const y = 100 + 60 * Math.sin(angle);
                            return (
                              <g key={`mid-${i}`}>
                                <path
                                  d={`M 100,100 L ${x},${y} L ${100 + 50 * Math.cos(angle + 0.3)},${100 + 50 * Math.sin(angle + 0.3)} Z`}
                                  fill="#D97706"
                                  opacity="0.5"
                                />
                              </g>
                            );
                          })}

                          {/* Inner decorative sun/flower */}
                          <circle cx="100" cy="100" r="40" fill="none" stroke="#F59E0B" strokeWidth="2"/>
                          {[...Array(16)].map((_, i) => {
                            const angle = (i * 22.5) * Math.PI / 180;
                            return (
                              <line
                                key={`ray-${i}`}
                                x1="100"
                                y1="100"
                                x2={100 + 35 * Math.cos(angle)}
                                y2={100 + 35 * Math.sin(angle)}
                                stroke="#FCD34D"
                                strokeWidth="1.5"
                              />
                            );
                          })}
                          <circle cx="100" cy="100" r="15" fill="#F59E0B"/>
                          <circle cx="100" cy="100" r="12" fill="none" stroke="#FCD34D" strokeWidth="1"/>
                          
                          {/* Decorative curved elements */}
                          {[...Array(6)].map((_, i) => {
                            const angle = (i * 60) * Math.PI / 180;
                            return (
                              <path
                                key={`curve-${i}`}
                                d={`M ${100 + 45 * Math.cos(angle)},${100 + 45 * Math.sin(angle)} 
                                    Q ${100 + 55 * Math.cos(angle + 0.2)},${100 + 55 * Math.sin(angle + 0.2)} 
                                    ${100 + 45 * Math.cos(angle + 0.52)},${100 + 45 * Math.sin(angle + 0.52)}`}
                                fill="none"
                                stroke="#D97706"
                                strokeWidth="1.5"
                                opacity="0.8"
                              />
                            );
                          })}
                        </svg>
                      </motion.div>
                    </div>

                    {/* Right side - Company Info */}
                    <div className="w-1/2 h-full flex flex-col justify-center p-6 md:p-10">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                      >
                        <div>
                          <h1 className="text-3xl md:text-5xl font-bold text-amber-500 tracking-wide mb-2">
                            GLIMMR
                          </h1>
                          <div className="h-px bg-gradient-to-r from-amber-500 to-transparent w-3/4 mb-3"></div>
                          <p className="text-amber-400 text-xs md:text-sm uppercase tracking-widest">
                            Jewelry, Precious Metals
                          </p>
                          <p className="text-amber-300 text-xs md:text-sm uppercase tracking-widest">
                            & Diamonds
                          </p>
                        </div>
                        
                        <div className="pt-4">
                          <p className="text-amber-400 text-xs md:text-sm tracking-wider">
                            www.glimmr.com
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div
                className="absolute inset-0 backface-hidden rounded-none shadow-2xl overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="relative h-full flex">
                  {/* Left side - Black background with contact info */}
                  <div className="w-3/5 bg-black p-6 md:p-10 flex flex-col justify-between">
                    <div>
                      <motion.div
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                      >
                        <h2 className="text-2xl md:text-3xl font-bold text-amber-500 mb-1">
                          Ayush Soni
                        </h2>
                        <p className="text-amber-400 text-sm md:text-base">
                          Owner
                        </p>
                      </motion.div>

                      <motion.div
                        className="space-y-4"
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-amber-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <p className="text-amber-200 text-sm">+91 9414548280</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-amber-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-amber-200 text-sm">ayush@glimmr.com</p>
                        </div>

                        <div className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <p className="text-amber-200 text-sm leading-relaxed">
                            123 Diamond Street, Jewelry District<br />
                            Mumbai, Maharashtra 400001
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      className="flex gap-3"
                      initial={{ rotateY: 180, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {[
                        { path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                        { path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                        { path: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01' },
                      ].map((social, idx) => (
                        <motion.button
                          key={idx}
                          className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center hover:bg-amber-500/30 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg
                            className="w-4 h-4 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={social.path}
                            />
                          </svg>
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* Right side - White/cream background with logo */}
                  <div className="w-2/5 bg-gradient-to-br from-amber-50 to-white p-6 md:p-8 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      {/* Logo - Smaller mandala */}
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 40,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="mb-4"
                      >
                        <svg className="w-24 h-24 md:w-32 md:h-32 mx-auto" viewBox="0 0 120 120">
                          {/* Outer circle */}
                          <circle cx="60" cy="60" r="55" fill="none" stroke="#D97706" strokeWidth="1" opacity="0.6"/>
                          
                          {/* Petals */}
                          {[...Array(8)].map((_, i) => {
                            const angle = (i * 45) * Math.PI / 180;
                            const x1 = 60 + 40 * Math.cos(angle);
                            const y1 = 60 + 40 * Math.sin(angle);
                            return (
                              <g key={i}>
                                <path
                                  d={`M ${x1},${y1} Q ${60 + 50 * Math.cos(angle)},${60 + 50 * Math.sin(angle)} ${60 + 40 * Math.cos(angle + 0.4)},${60 + 40 * Math.sin(angle + 0.4)}`}
                                  fill="none"
                                  stroke="#F59E0B"
                                  strokeWidth="2"
                                />
                                <circle cx={60 + 45 * Math.cos(angle)} cy={60 + 45 * Math.sin(angle)} r="1.5" fill="#FCD34D"/>
                              </g>
                            );
                          })}
                          
                          {/* Center sun */}
                          <circle cx="60" cy="60" r="25" fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
                          {[...Array(12)].map((_, i) => {
                            const angle = (i * 30) * Math.PI / 180;
                            return (
                              <line
                                key={`ray-${i}`}
                                x1="60"
                                y1="60"
                                x2={60 + 22 * Math.cos(angle)}
                                y2={60 + 22 * Math.sin(angle)}
                                stroke="#FCD34D"
                                strokeWidth="1"
                              />
                            );
                          })}
                          <circle cx="60" cy="60" r="10" fill="#F59E0B"/>
                          <circle cx="60" cy="60" r="8" fill="none" stroke="#FCD34D" strokeWidth="0.5"/>
                        </svg>
                      </motion.div>

                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-amber-700 mb-1">
                          GLIMMR
                        </h3>
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full mb-2"></div>
                        <p className="text-amber-600 text-xs uppercase tracking-wider">
                          Precious Metals
                        </p>
                        <p className="text-amber-600 text-xs uppercase tracking-wider">
                          & Diamonds
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Card Templates Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
            Choose Your Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cardTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -10, scale: 1.05 }}
                onHoverStart={() => setHoveredCard(template.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative cursor-pointer"
              >
                <div
                  className={`relative overflow-hidden rounded-xl shadow-xl border-2 ${template.borderColor} aspect-[1.75] bg-gradient-to-br ${template.gradient} p-6`}
                >
                  {/* Animated shimmer on hover */}
                  {hoveredCard === template.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}

                  {/* Floating diamonds */}
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{
                      rotate: hoveredCard === template.id ? 360 : 0,
                      scale: hoveredCard === template.id ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <DiamondIcon className={`w-8 h-8 ${template.accentColor}`} />
                  </motion.div>

                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: hoveredCard === template.id ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className={`text-2xl font-bold ${template.accentColor} mb-2`}>
                        Glimmrr
                      </h3>
                      <p className={`text-sm ${template.accentColor} opacity-80 mb-4`}>
                        {template.name}
                      </p>
                    </motion.div>

                    <motion.div
                      className="mt-6 space-y-1 text-sm"
                      animate={{
                        x: hoveredCard === template.id ? 5 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={template.accentColor}>Rajesh Kumar</div>
                      <div className={`${template.accentColor} opacity-70`}>Chief Designer</div>
                    </motion.div>
                  </div>

                  {/* Corner decorations */}
                  <motion.div
                    className={`absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 ${template.borderColor} rounded-tl`}
                    animate={{
                      scale: hoveredCard === template.id ? 1.2 : 1,
                    }}
                  />
                  <motion.div
                    className={`absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 ${template.borderColor} rounded-br`}
                    animate={{
                      scale: hoveredCard === template.id ? 1.2 : 1,
                    }}
                  />
                </div>

                <div className="text-center mt-4">
                  <span className={`font-semibold ${template.accentColor}`}>
                    {template.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {[
            {
              icon: '💎',
              title: 'Premium Materials',
              description: 'Printed on luxury cardstock with metallic finishes',
            },
            {
              icon: '✨',
              title: 'Elegant Design',
              description: 'Sophisticated jewelry-inspired aesthetics',
            },
            {
              icon: '🎨',
              title: 'Customizable',
              description: 'Personalize with your information and branding',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-amber-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 rounded-2xl p-12 shadow-xl"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Ready to Make an Impression?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Get your custom jewelry-themed business cards today
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Order Now
          </motion.button>
        </motion.div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default BusinessCard;
