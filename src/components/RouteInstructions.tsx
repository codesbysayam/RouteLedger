import React from 'react';
import { RouteStep } from '../types.ts';
import { Navigation, ArrowUpRight, CornerDownRight, CornerUpRight, Compass } from 'lucide-react';

interface RouteInstructionsProps {
  steps: RouteStep[];
  originName: string;
  destName: string;
  totalMiles?: number;
  totalDriveHours?: number;
}

export const RouteInstructions: React.FC<RouteInstructionsProps> = ({
  steps,
  originName,
  destName,
  totalMiles,
  totalDriveHours,
}) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="p-12 text-center text-[#526174] bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] select-none shadow-xs">
        <Compass className="w-8 h-8 mx-auto mb-2 text-[#2563EB]" />
        <p className="font-semibold text-sm text-[#172033]">No Route Instructions Available</p>
        <p className="text-xs text-[#526174] mt-1">
          Plan a route in the Trip Planner to generate turn-by-turn road instructions.
        </p>
      </div>
    );
  }

  const getStepIcon = (type?: string, modifier?: string) => {
    if (modifier?.includes('right')) return <ArrowUpRight className="w-3.5 h-3.5 text-[#2563EB]" />;
    if (modifier?.includes('left')) return <CornerUpRight className="w-3.5 h-3.5 text-[#2563EB] -scale-x-100" />;
    if (type?.includes('turn')) return <CornerDownRight className="w-3.5 h-3.5 text-[#0891B2]" />;
    return <Navigation className="w-3.5 h-3.5 text-[#526174]" />;
  };

  const hours = totalDriveHours ? Math.floor(totalDriveHours) : 0;
  const minutes = totalDriveHours ? Math.round((totalDriveHours - hours) * 60) : 0;
  const driveTimeStr = totalDriveHours ? `${hours}h ${minutes}m driving` : '';

  return (
    <div
      id="route-instructions-container"
      className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] overflow-hidden select-none shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative"
    >
      {/* 3px Top Accent Line */}
      <div className="h-[3px] w-full bg-[#2563EB] shrink-0" />

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#D9E2EC] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span className="text-[11px] font-bold text-[#2563EB] tracking-[0.08em] uppercase">
                ROUTE INSTRUCTIONS &amp; ROAD MANEUVERS
              </span>
            </div>
            <span className="text-[#D9E2EC] ml-1">|</span>
            <span className="text-[11px] font-mono font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFD5FF]">
              {steps.length} maneuvers
            </span>
          </div>
          <div className="text-[13.5px] font-medium mt-1 flex items-center gap-2">
            <span className="text-[#2563EB] font-bold">{originName}</span>
            <span className="text-[#526174] font-bold">→</span>
            <span className="text-[#172033] font-semibold">{destName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[13px] text-[#172033]">
          {totalMiles !== undefined && totalMiles > 0 && (
            <span className="font-bold text-[#2563EB]">{totalMiles.toFixed(1)} mi</span>
          )}
          {driveTimeStr && (
            <>
              <span className="text-[#D9E2EC]">·</span>
              <span className="text-[#526174] font-semibold">{driveTimeStr}</span>
            </>
          )}
        </div>
      </div>

      {/* Maneuvers List as Operational Event Rows */}
      <div className="divide-y divide-[#E2E8F0]">
        {steps.map((step, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === steps.length - 1;
          const isOdd = idx % 2 === 1;

          // Determine left accent indicator color
          const leftAccentColor = isFirst
            ? 'border-l-[3px] border-l-[#2563EB]'
            : isLast
            ? 'border-l-[3px] border-l-[#16A34A]'
            : 'border-l-[3px] border-l-transparent hover:border-l-[#2563EB]';

          return (
            <div
              key={`step-${idx}`}
              className={`px-4 sm:px-5 py-2.5 min-h-[40px] flex items-center justify-between gap-4 text-[13px] transition-colors duration-150 ${leftAccentColor} ${
                isOdd ? 'bg-[#F8FAFC]' : 'bg-[#FFFFFF]'
              } hover:bg-[#F1F5F9]`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[11px] font-bold text-[#2563EB] w-6 h-6 rounded bg-[#EFF6FF] border border-[#BFD5FF] flex items-center justify-center shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div className="w-6 h-6 rounded-[5px] bg-[#EFF6FF] border border-[#BFD5FF] flex items-center justify-center shrink-0">
                  {getStepIcon(step.type, step.modifier)}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-[#172033] truncate text-[13px]">
                    {step.instruction}
                  </div>
                  {step.name && step.name !== 'highway' && (
                    <div className="text-[11.5px] text-[#526174] truncate font-mono">
                      {step.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 text-right">
                {step.duration_minutes > 0 && (
                  <span className="font-mono text-[10.5px] font-semibold text-[#6366F1] bg-[#F3F1FF] px-1.5 py-0.5 rounded border border-[#DDD6FE]">
                    {Math.round(step.duration_minutes)} min
                  </span>
                )}
                <div className="font-mono text-[12px] font-bold text-[#16A34A] min-w-[54px] text-right">
                  {step.distance_miles < 0.1
                    ? `${Math.round(step.distance_miles * 5280)} ft`
                    : `${step.distance_miles.toFixed(1)} mi`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

