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
    <div id="hero-metric-strip" className="space-y-3 select-none">
      {/* 4 Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* CARD 1: TOTAL DISTANCE */}
        <div
          id="metric-card-distance"
          className="relative bg-white border border-[#D9E2EC] rounded-xl p-4 overflow-hidden shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold tracking-wide text-[#526174] uppercase">
              Total Distance
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFD5FF] flex items-center justify-center text-[#2563EB]">
              <Navigation className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-[#172033] leading-none">
              {distance.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="text-sm font-semibold text-[#526174] ml-1">mi</span>
            </div>
            <p className="text-xs font-medium text-[#526174] mt-1.5 truncate">
              OSRM corridor route
            </p>
          </div>
        </div>

        {/* CARD 2: TOTAL DRIVE TIME */}
        <div
          id="metric-card-drive-time"
          className="relative bg-white border border-[#D9E2EC] rounded-xl p-4 overflow-hidden shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold tracking-wide text-[#526174] uppercase">
              Total Drive Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFD5FF] flex items-center justify-center text-[#2563EB]">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-[#172033] leading-none">
              {driveHoursDecimal.toFixed(1)}
              <span className="text-sm font-semibold text-[#526174] ml-0.5">h</span>
            </div>
            <p className="text-xs font-medium text-[#526174] mt-1.5 truncate">
              Driving &amp; maneuvers
            </p>
          </div>
        </div>

        {/* CARD 3: TRIP DURATION */}
        <div
          id="metric-card-trip-duration"
          className="relative bg-white border border-[#D9E2EC] rounded-xl p-4 overflow-hidden shadow-xs flex flex-col justify-between transition-colors"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold tracking-wide text-[#526174] uppercase">
              Trip Duration
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFD5FF] flex items-center justify-center text-[#2563EB]">
              <Calendar className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-[#172033] leading-none">
              {daysCount}{' '}
              <span className="text-sm font-semibold text-[#526174]">
                {daysCount === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <p className="text-xs font-medium text-[#526174] mt-1.5 truncate">
              {daysCount} duty {daysCount === 1 ? 'period' : 'periods'} scheduled
            </p>
          </div>
        </div>

        {/* CARD 4: HOS COMPLIANCE */}
        <div
          id="metric-card-compliance"
          className="relative bg-white border border-[#D9E2EC] rounded-xl p-4 overflow-hidden shadow-xs flex flex-col justify-between transition-colors"
        >
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] ${
              isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
            }`}
          />
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-xs font-bold tracking-wide uppercase text-[#526174]"
            >
              HOS Compliance
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCompliant ? 'bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0]' : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div>
            <div
              className={`font-mono text-2xl font-bold leading-none ${
                isCompliant ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {isCompliant ? '100%' : `${violationCount} Violations`}
            </div>
            <p
              className={`text-xs font-medium mt-1.5 truncate ${
                isCompliant ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              {isCompliant ? '§ 395 compliant' : 'FMCSA violation detected'}
            </p>
          </div>
        </div>
      </div>

      {/* Auxiliary Operational Ribbon: Fuel & Cycle Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-white border border-[#D9E2EC] rounded-lg text-xs text-[#526174]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-[#D97706]" />
            <span>Fuel Interval: <strong className="font-mono text-[#172033]">{fuelStops}</strong> stop{fuelStops !== 1 ? 's' : ''} (1,000 mi rule)</span>
          </span>
          <span className="text-[#CBD5E1]">|</span>
          <span className="flex items-center gap-1.5">
            <BatteryCharging className="w-4 h-4 text-[#2563EB]" />
            <span>70-Hour Clock: <strong className="font-mono text-[#172033]">{cycleRemaining.toFixed(1)}h</strong> remaining ({finalCycleUsed.toFixed(1)}h used)</span>
          </span>
        </div>
        <span className="text-xs text-[#526174] font-medium font-mono">
          FMCSA 49 CFR § 395.3 Certified
        </span>
      </div>
    </div>
  );
};


