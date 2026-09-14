import React from 'react';
import { Printer, RotateCcw, Loader2 } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  origin?: string;
  destination?: string;
  routeHeading?: string;
  statusText?: string;
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
  onLoadExample,
  onPrint,
  isLoading = false,
}) => {
  // If origin and destination are passed, render the distinctive route header
  const hasRoute = Boolean(origin && destination);

  return (
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3 select-none pb-3 border-b border-[#E5E7EB]">
      <div>
        {/* Section Tag */}
        <div className="text-[11px] font-semibold text-[#5B6470] uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span>{title}</span>
          <span className="w-1 h-1 rounded-full bg-[#0F9D8A]" />
        </div>

        {hasRoute ? (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-[#5B6470]">
              {origin}
            </span>
            <span className="text-[18px] sm:text-[20px] font-semibold text-[#0F9D8A] px-0.5">
              →
            </span>
            <span className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-[#111827]">
              {destination}
            </span>

            {statusText && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF] px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]" />
                {statusText}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-[#111827]">
              {routeHeading || title}
            </h1>
            {statusText && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF] px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]" />
                {statusText}
              </span>
            )}
          </div>
        )}

        {subtitle && !statusText && (
          <p className="text-[12px] text-[#5B6470] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 print:hidden">
        {onLoadExample && (
          <button
            type="button"
            onClick={onLoadExample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#5B6470] hover:text-[#111827] bg-white border border-[#D9DDE3] rounded-[7px] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-[#5B6470]" />
            )}
            <span>Load Example</span>
          </button>
        )}

        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#111827] bg-white border border-[#D9DDE3] rounded-[7px] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#5B6470]" />
            <span>Print Sheet</span>
          </button>
        )}
      </div>
    </header>
  );
};

