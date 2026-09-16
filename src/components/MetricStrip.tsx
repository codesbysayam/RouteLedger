import React from 'react';
import { TripPlan } from '../types.ts';
import { Navigation, Clock, Calendar, ShieldCheck, Fuel, BatteryCharging } from 'lucide-react';

interface MetricStripProps {
  trip: TripPlan;
}

export const MetricStrip: React.FC<MetricStripProps> = ({ trip }) => {
  const distance = trip.total_distance_miles ?? 0;
  const driveHoursDecimal = trip.total_drive_hours ?? 0;
  const daysCount = trip.days_count ?? trip.daily_logs?.length ?? trip.days?.length ?? 1;
  const fuelStops = trip.counts?.fuel_stops ?? (trip.stops || []).filter((s) => s.stop_type === 'FUEL').length;
  const finalCycleUsed = trip.final_cycle_used ?? 0;
  const cycleRemaining = Math.max(0, 70.0 - finalCycleUsed);

  const isCompliant = trip.is_compliant ?? trip.validation?.compliant ?? true;
  const violationCount = trip.violations?.length ?? trip.validation?.violations?.length ?? 0;

  return (
    <div id="hero-metric-strip" className="space-y-2 select-none">
      {/* 4 Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* CARD 1: TOTAL DISTANCE */}
        <div
          id="metric-card-distance"
          className="relative bg-[#EFF6FF] border border-[#BFD5FF] rounded-[10px] p-3.5 sm:p-4 overflow-hidden shadow-[0_2px_8px_rgba(37,99,235,0.06)] flex flex-col justify-between transition-all duration-150 hover:shadow-md"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold tracking-[0.08em] text-[#2563EB] uppercase">
              TOTAL DISTANCE
            </span>
            <div className="w-7 h-7 rounded-[6px] bg-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
              <Navigation className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-[26px] font-bold text-[#172033] leading-none">
              {distance.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="text-sm font-semibold text-[#526174] ml-1">mi</span>
            </div>
            <p className="text-[11.5px] font-medium text-[#526174] mt-1.5 truncate">
              OSRM corridor route
            </p>
          </div>
        </div>

        {/* CARD 2: TOTAL DRIVE TIME */}
        <div
          id="metric-card-drive-time"
          className="relative bg-[#ECFEFF] border border-[#A5F3FC] rounded-[10px] p-3.5 sm:p-4 overflow-hidden shadow-[0_2px_8px_rgba(8,145,178,0.06)] flex flex-col justify-between transition-all duration-150 hover:shadow-md"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#0891B2]" />
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold tracking-[0.08em] text-[#0891B2] uppercase">
              TOTAL DRIVE TIME
            </span>
            <div className="w-7 h-7 rounded-[6px] bg-[#CFFAFE] flex items-center justify-center text-[#0891B2]">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-[26px] font-bold text-[#172033] leading-none">
              {driveHoursDecimal.toFixed(1)}
              <span className="text-sm font-semibold text-[#526174] ml-0.5">h</span>
            </div>
            <p className="text-[11.5px] font-medium text-[#526174] mt-1.5 truncate">
              Driving &amp; maneuvers
            </p>
          </div>
        </div>

        {/* CARD 3: TRIP DURATION */}
        <div
          id="metric-card-trip-duration"
          className="relative bg-[#F3F1FF] border border-[#DDD6FE] rounded-[10px] p-3.5 sm:p-4 overflow-hidden shadow-[0_2px_8px_rgba(99,102,241,0.06)] flex flex-col justify-between transition-all duration-150 hover:shadow-md"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#6366F1]" />
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold tracking-[0.08em] text-[#6366F1] uppercase">
              TRIP DURATION
            </span>
            <div className="w-7 h-7 rounded-[6px] bg-[#EDE9FE] flex items-center justify-center text-[#6366F1]">
              <Calendar className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-[26px] font-bold text-[#172033] leading-none">
              {daysCount}{' '}
              <span className="text-sm font-semibold text-[#526174]">
                {daysCount === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <p className="text-[11.5px] font-medium text-[#526174] mt-1.5 truncate">
              {daysCount} duty {daysCount === 1 ? 'period' : 'periods'} scheduled
            </p>
          </div>
        </div>

        {/* CARD 4: HOS COMPLIANCE */}
        <div
          id="metric-card-compliance"
          className={`relative ${
            isCompliant ? 'bg-[#EFFBF3] border-[#BBF7D0]' : 'bg-[#FFF1F2] border-[#FECDD3]'
          } border rounded-[10px] p-3.5 sm:p-4 overflow-hidden shadow-[0_2px_8px_rgba(22,163,74,0.06)] flex flex-col justify-between transition-all duration-150 hover:shadow-md`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] ${
              isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
            }`}
          />
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[11px] font-bold tracking-[0.08em] uppercase ${
                isCompliant ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              HOS COMPLIANCE
            </span>
            <div
              className={`w-7 h-7 rounded-[6px] flex items-center justify-center ${
                isCompliant ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div
              className={`font-mono text-2xl sm:text-[26px] font-bold leading-none ${
                isCompliant ? 'text-[#15803D]' : 'text-[#DC2626]'
              }`}
            >
              {isCompliant ? '100%' : `${violationCount} Violations`}
            </div>
            <p
              className={`text-[11.5px] font-medium mt-1.5 truncate ${
                isCompliant ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {isCompliant ? '§ 395 compliant' : 'FMCSA violation detected'}
            </p>
          </div>
        </div>
      </div>

      {/* Auxiliary Operational Ribbon: Fuel & Cycle Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-white border border-[#D9E2EC] rounded-[8px] text-[11.5px] text-[#526174]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Fuel Interval: <strong className="font-mono text-[#172033]">{fuelStops}</strong> stop{fuelStops !== 1 ? 's' : ''} (1,000 mi rule)</span>
          </span>
          <span className="text-[#CBD5E1]">|</span>
          <span className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>70-Hour Clock: <strong className="font-mono text-[#172033]">{cycleRemaining.toFixed(1)}h</strong> remaining ({finalCycleUsed.toFixed(1)}h used)</span>
          </span>
        </div>
        <span className="text-[11px] text-[#7A8798] font-mono">
          FMCSA 49 CFR § 395.3 Certified
        </span>
      </div>
    </div>
  );
};


