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
      <div className="p-12 text-center text-[#7A8490] bg-white rounded-[8px] border border-[#EAECF0] select-none">
        <Compass className="w-8 h-8 mx-auto mb-2 text-[#A4ACB5]" />
        <p className="font-semibold text-sm text-[#171A1F]">No Route Instructions Available</p>
        <p className="text-xs text-[#7A8490] mt-1">
          Plan a route in the Trip Planner to generate turn-by-turn road instructions.
        </p>
      </div>
    );
  }

  const getStepIcon = (type?: string, modifier?: string) => {
    if (modifier?.includes('right')) return <ArrowUpRight className="w-3.5 h-3.5 text-[#2563EB]" />;
    if (modifier?.includes('left')) return <CornerUpRight className="w-3.5 h-3.5 text-[#2563EB] -scale-x-100" />;
    if (type?.includes('turn')) return <CornerDownRight className="w-3.5 h-3.5 text-[#59636E]" />;
    return <Navigation className="w-3.5 h-3.5 text-[#7A8490]" />;
  };

  const hours = totalDriveHours ? Math.floor(totalDriveHours) : 0;
  const minutes = totalDriveHours ? Math.round((totalDriveHours - hours) * 60) : 0;
  const driveTimeStr = totalDriveHours ? `${hours}h ${minutes}m driving` : '';

  return (
    <div
      id="route-instructions-container"
      className="bg-white border border-[#E2E6EA] rounded-[10px] overflow-hidden select-none shadow-none"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E6EA] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-[#5B6470] tracking-wider uppercase">
                ROUTE INSTRUCTIONS
              </span>
              <div className="w-5 h-[2px] bg-[#0F9D8A] mt-0.5 rounded-full" />
            </div>
            <span className="text-[#D1D5DB] ml-1">|</span>
            <span className="text-[11px] font-mono text-[#7A8490]">{steps.length} maneuvers</span>
          </div>
          <div className="text-[14px] font-semibold text-[#111827] mt-1 flex items-center gap-1.5">
            <span>{originName}</span>
            <span className="text-[#0F9D8A] font-semibold">→</span>
            <span>{destName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[13px] text-[#111827]">
          {totalMiles !== undefined && totalMiles > 0 && (
            <span className="font-semibold">{totalMiles.toFixed(1)} mi</span>
          )}
          {driveTimeStr && (
            <>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-[#5B6470]">{driveTimeStr}</span>
            </>
          )}
        </div>
      </div>

      {/* Maneuvers List */}
      <div className="divide-y divide-[#E2E6EA]">
        {steps.map((step, idx) => (
          <div
            key={`step-${idx}`}
            className="px-5 py-3 flex items-center justify-between gap-4 text-[13px] hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[11px] text-[#A4ACB5] w-6 shrink-0">
                {String(idx + 1).padStart(2, '0')}
              </span>

              <div className="w-6 h-6 rounded-[5px] bg-[#F3F4F6] flex items-center justify-center shrink-0">
                {getStepIcon(step.type, step.modifier)}
              </div>

              <div className="min-w-0">
                <div className="font-medium text-[#171A1F] truncate">
                  {step.instruction}
                </div>
                {step.name && step.name !== 'highway' && (
                  <div className="text-[11px] text-[#7A8490] truncate mt-0.5 font-mono">
                    {step.name}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-mono text-[12px] text-[#171A1F]">
                {step.distance_miles < 0.1
                  ? `${Math.round(step.distance_miles * 5280)} ft`
                  : `${step.distance_miles.toFixed(1)} mi`}
              </div>
              {step.duration_minutes > 0 && (
                <div className="font-mono text-[11px] text-[#7A8490]">
                  {Math.round(step.duration_minutes)} min
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
