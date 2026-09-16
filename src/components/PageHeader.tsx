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
    <header className="p-5 sm:p-6 rounded-xl bg-[#FFFFFF] border border-[#D9E2EC] shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden mb-5 flex flex-wrap items-center justify-between gap-4 select-none">
      {/* Top Gradient Accent Line */}
      <div className="h-[3px] bg-[#2563EB] absolute top-0 left-0 right-0" />

      <div className="z-10">
        {/* Small Section Label in Commercial Blue */}
        <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span>{title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span className="text-xs text-[#526174] font-medium normal-case">FMCSA CFR 395 Engine</span>
        </div>

        {isRouteTitle ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 bg-[#EFF6FF] border border-[#BFD5FF] text-[#2563EB] px-3.5 py-1.5 rounded-lg text-lg sm:text-xl font-bold font-mono tracking-tight shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              {originPart}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#526174] px-1">
              →
            </span>
            <span className="inline-flex items-center gap-2 bg-[#EFF6FF] border border-[#BFD5FF] text-[#2563EB] px-3.5 py-1.5 rounded-lg text-lg sm:text-xl font-bold font-mono tracking-tight shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              {destPart}
            </span>
          </div>
        ) : (
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
            {routeHeading || title}
          </h1>
        )}

        {subtitle ? (
          <p className="text-xs text-[#526174] mt-2 font-medium">{subtitle}</p>
        ) : (
          <p className="text-xs text-[#526174] mt-1.5">
            Real-time OSRM navigation coordinates with strict 49 CFR § 395.8 automated electronic duty audit.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0 print:hidden z-10">
        {/* Verification Status Block */}
        {statusText && (
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-xs ${
              isCompliant
                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#16A34A]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-none">
                {isCompliant ? 'FMCSA Compliant' : 'HOS Violation Detected'}
              </span>
              <span className="text-xs text-[#526174] font-medium leading-tight">
                {isCompliant ? 'All 6 regulatory rules verified' : 'Shift limits exceeded'}
              </span>
            </div>
          </div>
        )}

        {onLoadExample && (
          <button
            type="button"
            onClick={onLoadExample}
            disabled={isLoading}
            className="h-10 px-3.5 text-xs font-semibold text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] hover:bg-[#F8FAFC] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 text-[#2563EB]" />
            )}
            <span>Load Example</span>
          </button>
        )}

        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="h-10 px-3.5 text-xs font-semibold text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] hover:bg-[#F8FAFC] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#526174]" />
            <span>Print Sheet</span>
          </button>
        )}
      </div>
    </header>
  );
};

