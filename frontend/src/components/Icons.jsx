// Minimal SVG Icons for Jewelry Website
// All icons use elegant golden colors

export const ShoppingBagIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

export const WalletIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <path d="M1 10h22"/>
    <rect x="16" y="14" width="4" height="4" rx="1" ry="1"/>
  </svg>
);

export const HeartIcon = ({ size = 24, className = '' }) => (
  <img 
    src="https://cdn-icons-png.freepik.com/512/11366/11366667.png?uid=R162432181"
    width={size}
    height={size}
    alt="Heart"
    className={`${className}`}
    style={{ display: 'inline-block' }}
  />
);

export const StarIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <path d="M12 2l2.8 6.2 6.7.6-5 4.5 1.5 6.7-6-3.4-6 3.4 1.5-6.7-5-4.5 6.7-.6L12 2z" fill="currentColor" fillOpacity="0.15" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export const DiamondIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="currentColor" fillOpacity="0.1" />
    <path d="M11 3l-4 6 5 12 5-12-4-6" />
    <path d="M2 9h20" />
  </svg>
);

export const UserIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <circle cx="12" cy="8" r="4.5" fill="currentColor" fillOpacity="0.1" />
    <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    <path d="M12 2v2m-3-1l.8 1.5M15 3l-.8 1.5" />
  </svg>
);

export const MapPinIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <path d="M12 21s-7-5.5-7-11.5a7 7 0 1 1 14 0c0 6-7 11.5-7 11.5z" fill="currentColor" fillOpacity="0.1" />
    <circle cx="12" cy="9.5" r="2.5" fill="currentColor" fillOpacity="0.3" />
    <path d="M12 2v3m10 7.5h-3M2 12.5h3" />
  </svg>
);

export const OrderIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" fillOpacity="0.08" />
    <path d="M3 10h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M9 14h6m-4 3h4" />
    <circle cx="12" cy="14" r="0.8" fill="currentColor" />
  </svg>
);

export const SettingsIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.15" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const LockIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <rect x="4" y="10" width="16" height="11" rx="2" fill="currentColor" fillOpacity="0.1" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    <path d="M12 16.5V18" />
  </svg>
);

export const BookmarkIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

export const MessageIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.1" />
    <path d="M8 9h8m-6 3h4" />
  </svg>
);

export const UsersIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <circle cx="9" cy="8" r="3.5" fill="currentColor" fillOpacity="0.1" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    <circle cx="17" cy="7" r="2.5" fill="currentColor" fillOpacity="0.15" />
    <path d="M17 13.5c2.5 0 5 1.8 5 4.5" />
  </svg>
);

export const GiftIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <rect x="3" y="11" width="18" height="11" rx="1.5" fill="currentColor" fillOpacity="0.08" />
    <rect x="2" y="7" width="20" height="4" rx="1" fill="currentColor" fillOpacity="0.15" />
    <line x1="12" y1="7" x2="12" y2="22" />
    <path d="M12 7c0-2.5-2.5-4-4.5-4C5.5 3 4.5 4.5 6 6.5L12 7z" />
    <path d="M12 7c0-2.5 2.5-4 4.5-4 2 0 3 1.5 1.5 3.5L12 7z" />
  </svg>
);

export const CreditCardIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <rect x="2" y="5" width="20" height="14" rx="2.5" fill="currentColor" fillOpacity="0.1" />
    <path d="M2 10h20" strokeWidth="2" />
    <rect x="5" y="14" width="4" height="2.5" rx="0.5" fill="currentColor" />
    <path d="M15 15.5h4" />
  </svg>
);

export const LogoutIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const InfoIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <circle cx="12" cy="12" r="9.5" fill="currentColor" fillOpacity="0.08" />
    <line x1="12" y1="16" x2="12" y2="11" strokeWidth="2" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" />
  </svg>
);

export const RewardIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#B59A6C] ${className}`}>
    <path d="M12 2l3 5 6 1-4 4.5 1 6-6-3-6 3 1-6-4-4.5 6-1z" fill="currentColor" fillOpacity="0.12" />
    <circle cx="12" cy="10" r="2" fill="currentColor" />
    <path d="M9.5 17.5L8 22l4-2 4 2-1.5-4.5" />
  </svg>
);

export const CheckCircleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-emerald-600 ${className}`}>
    <circle cx="12" cy="12" r="9.5" fill="currentColor" fillOpacity="0.1" />
    <polyline points="16 9 10.5 14.5 8 12" strokeWidth="2" />
  </svg>
);

export const AlertCircleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-rose-600 ${className}`}>
    <circle cx="12" cy="12" r="9.5" fill="currentColor" fillOpacity="0.1" />
    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
    <circle cx="12" cy="15.5" r="1" fill="currentColor" />
  </svg>
);

export const EmailIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-10 5L2 7"/>
  </svg>
);

export const PhoneIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export const TrashIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

export const UnlockIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

export const EyeIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const RobotIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <rect x="9" y="4" width="6" height="3"/>
    <rect x="3" y="7" width="18" height="11" rx="2"/>
    <circle cx="8" cy="12" r="1.5"/>
    <circle cx="16" cy="12" r="1.5"/>
    <line x1="12" y1="17" x2="12" y2="20"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
  </svg>
);

export const ChatIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export const BookIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

export const CodeIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

export const GlobeIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export const PenIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export const PaletteIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <circle cx="13" cy="13" r="8"/>
    <path d="M5.5 8.5c.5-1 1.5-2.5 3.5-2.5s3 1.5 3.5 2.5"/>
    <circle cx="6.5" cy="12" r="1"/>
    <circle cx="19.5" cy="10" r="1"/>
    <circle cx="10" cy="6.5" r="1"/>
  </svg>
);

export const BellIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export const HelpCircleIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-amber-700 ${className}`}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

export const ArrowRightIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const ShieldCheckIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.08" />
    <polyline points="9 12 11 14 15 10" strokeWidth="2" />
  </svg>
);

export const TruckIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="1" y="3" width="15" height="13" rx="1" fill="currentColor" fillOpacity="0.08" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" fill="currentColor" fillOpacity="0.12" />
    <circle cx="5.5" cy="18.5" r="2.5" fill="currentColor" />
    <circle cx="18.5" cy="18.5" r="2.5" fill="currentColor" />
  </svg>
);

export const TagIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" fill="currentColor" fillOpacity="0.1" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" />
  </svg>
);

export const RefreshIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const DownloadIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const SparklesIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export const MailIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-10 5L2 7"/>
  </svg>
);

export const SearchIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);





