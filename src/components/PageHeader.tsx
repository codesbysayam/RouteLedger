import React from 'react';
import { Printer, RotateCcw, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  origin?: string;
  destination?: string;
  routeHeading?: string;
  statusText?: string;
  isCompliant?: boolean;
  onLoadExample?: () => void;
  onPrint?: () => void;
  isLoading?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  origin,
  destination,
  routeHeading,
  statusText,
  isCompliant = true,
  onLoadExample,
  onPrint,
  isLoading = false,
}) => {
  // If origin and destination are passed or routeHeading contains "→"
  const hasRouteParts = Boolean(origin && destination);
  let originPart = origin || '';
  let destPart = destination || '';

  if (!hasRouteParts && routeHeading && routeHeading.includes('→')) {
    const parts = routeHeading.split('→');
    originPart = parts[0]?.trim() || '';
    destPart = parts[1]?.trim() || '';
  }

  const isRouteTitle = Boolean(originPart && destPart);

  return (
    <header className="p-5 sm:p-6 rounded-[10px] bg-[#FFFFFF] border border-[#D9E2EC] shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden mb-5 flex flex-wrap items-center justify-between gap-4 select-none">
      {/* Top Gradient Accent Line */}
      <div className="h-[3px] bg-[#2563EB] absolute top-0 left-0 right-0" />

      <div className="z-10">
        {/* Small Section Label in Commercial Blue */}
        <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-[0.08em] mb-2 flex items-center gap-1.5">
          <span>{title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span className="text-[10px] text-[#526174] font-mono">FMCSA CFR 395 ENGINE</span>
        </div>

        {isRouteTitle ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 bg-[#EFF6FF] border border-[#BFD5FF] text-[#2563EB] px-3.5 py-1 rounded-[7px] text-[18px] sm:text-[22px] font-bold font-mono tracking-tight shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              {originPart}
            </span>
            <span className="text-[20px] sm:text-[24px] font-bold text-[#526174] px-1">
              →
            </span>
            <span className="inline-flex items-center gap-2 bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] px-3.5 py-1 rounded-[7px] text-[18px] sm:text-[22px] font-bold font-mono tracking-tight shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
              {destPart}
            </span>
          </div>
        ) : (
          <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight text-[#172033]">
            {routeHeading || title}
          </h1>
        )}

        {subtitle ? (
          <p className="text-[12.5px] text-[#526174] mt-2 font-medium">{subtitle}</p>
        ) : (
          <p className="text-[12px] text-[#526174] mt-1.5">
            Real-time OSRM navigation coordinates with strict 49 CFR § 395.8 automated electronic duty audit.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0 print:hidden z-10">
        {/* Verification Status Block */}
        {statusText && (
          <div
            className={`px-3.5 py-2 rounded-[7px] border text-left shadow-xs ${
              isCompliant
                ? 'bg-[#ECFDF5] border-[#A7F3D0] border-l-4 border-l-[#16A34A] text-[#16A34A]'
                : 'bg-[#FEF2F2] border-[#FECACA] border-l-4 border-l-[#DC2626] text-[#DC2626]'
            }`}
          >
            <div className="flex items-center gap-2 text-[11.5px] font-bold tracking-tight">
              <span className={`w-2 h-2 rounded-full ${isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
              <span>{isCompliant ? 'FMCSA COMPLIANT' : 'HOS VIOLATION DETECTED'}</span>
            </div>
            <div className="text-[10.5px] text-[#526174] pl-4 leading-tight font-medium">
              {isCompliant ? 'All 6 regulatory rules verified' : 'Shift limits exceeded'}
            </div>
          </div>
        )}

        {onLoadExample && (
          <button
            type="button"
            onClick={onLoadExample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-[#172033] hover:text-[#2563EB] bg-[#FFFFFF] border border-[#D9E2EC] hover:border-[#2563EB] rounded-[7px] hover:bg-[#F8FAFC] transition-all disabled:opacity-50 cursor-pointer shadow-xs active:translate-y-0"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-[#2563EB] animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-[#2563EB]" />
            )}
            <span>Load Example</span>
          </button>
        )}

        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-[#172033] hover:text-[#2563EB] bg-[#FFFFFF] border border-[#D9E2EC] hover:border-[#2563EB] rounded-[7px] hover:bg-[#F8FAFC] transition-all cursor-pointer shadow-xs active:translate-y-0"
          >
            <Printer className="w-3.5 h-3.5 text-[#526174]" />
            <span>Print Sheet</span>
          </button>
        )}
      </div>
    </header>
  );
};

