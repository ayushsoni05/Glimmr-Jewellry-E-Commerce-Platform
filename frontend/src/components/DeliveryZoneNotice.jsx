import React from 'react';
import { DIDWANA_ZONE } from '../utils/deliveryZone';

const DeliveryZoneNotice = ({
  eligibility = null,
  pincode = '',
  city = '',
  compact = false,
  onOpenMap = null
}) => {
  const isEligible = eligibility?.isEligible;
  const whatsappUrl = eligibility?.whatsappUrl || DIDWANA_ZONE.whatsappUrl;

  if (isEligible) {
    return (
      <div className={`p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-body rounded ${compact ? 'py-2 px-2.5' : ''}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Didwana Delivery Zone Confirmed (PIN 341303)
            </span>
          </div>
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className="text-[10px] font-mono text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
            >
              View Showroom
            </button>
          )}
        </div>
        <p className="text-[11px] text-emerald-800 mt-1">
          Complimentary doorstep delivery is available for this Didwana address.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-amber-50/90 border border-amber-300 text-amber-950 text-xs font-body space-y-2.5 ${compact ? 'p-3' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
              Delivery Only in Didwana, Rajasthan (PIN 341303)
            </h4>
            <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
              Standard online checkout delivery is restricted strictly to Didwana.
              {pincode ? ` Entered PIN ${pincode} is outside Didwana.` : ' We do not offer direct online shipping outside Didwana.'}
            </p>
          </div>
        </div>
        {onOpenMap && (
          <button
            type="button"
            onClick={onOpenMap}
            className="text-[10px] font-mono text-amber-900 underline hover:text-black shrink-0 cursor-pointer"
          >
            Showroom Map
          </button>
        )}
      </div>

      <div className="pt-1 border-t border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="text-[11px] text-amber-800 font-medium">
          Deliveries outside Didwana are arranged exclusively via direct consultation:
        </span>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1fae53] text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-colors shadow-xs cursor-pointer"
        >
          <span>Message on WhatsApp</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default DeliveryZoneNotice;
