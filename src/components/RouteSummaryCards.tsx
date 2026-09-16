import React from 'react';
import { TripPlan } from '../types.ts';
import { Navigation, Clock, Calendar, ShieldCheck, Coffee, Fuel } from 'lucide-react';

interface RouteSummaryCardsProps {
  plan: TripPlan;
}

export const RouteSummaryCards: React.FC<RouteSummaryCardsProps> = ({ plan }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Distance - Blue */}
      <div className="bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />
        <div className="flex items-center justify-between text-[#526174] mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-[0.06em]">Total Route</span>
          <div className="w-6 h-6 rounded-md bg-[#EFF6FF] flex items-center justify-center">
            <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
        </div>
        <div className="font-mono text-[20px] font-extrabold text-[#172033]">
          {plan.total_distance_miles.toLocaleString()}
          <span className="text-[11px] font-semibold text-[#526174] ml-1 font-sans">mi</span>
        </div>
        <p className="text-[10.5px] text-[#526174] mt-0.5 truncate">Actual highway routing</p>
      </div>

      {/* 2. Drive Time - Cyan */}
      <div className="bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#0891B2]" />
        <div className="flex items-center justify-between text-[#526174] mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-[0.06em]">Drive Time</span>
          <div className="w-6 h-6 rounded-md bg-[#ECFEFF] flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-[#0891B2]" />
          </div>
        </div>
        <div className="font-mono text-[20px] font-extrabold text-[#172033]">
          {plan.total_drive_hours.toFixed(1)}
          <span className="text-[11px] font-semibold text-[#526174] ml-1 font-sans">hrs</span>
        </div>
        <p className="text-[10.5px] text-[#526174] mt-0.5">Behind-the-wheel</p>
      </div>

      {/* 3. Total Duration - Indigo */}
      <div className="bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#6366F1]" />
        <div className="flex items-center justify-between text-[#526174] mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-[0.06em]">Trip Duration</span>
          <div className="w-6 h-6 rounded-md bg-[#F3F1FF] flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-[#6366F1]" />
          </div>
        </div>
        <div className="font-mono text-[20px] font-extrabold text-[#172033]">
          {plan.estimated_total_duration_hours.toFixed(1)}
          <span className="text-[11px] font-semibold text-[#526174] ml-1 font-sans">hrs</span>
        </div>
        <p className="text-[10.5px] text-[#526174] mt-0.5">With all breaks &amp; rest</p>
      </div>

      {/* 4. Days Count - Amber */}
      <div className="bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D97706]" />
        <div className="flex items-center justify-between text-[#526174] mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-[0.06em]">Timeline</span>
          <div className="w-6 h-6 rounded-md bg-[#FFFBEB] flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
          </div>
        </div>
        <div className="font-mono text-[20px] font-extrabold text-[#172033]">
          {plan.days_count}
          <span className="text-[11px] font-semibold text-[#526174] ml-1 font-sans">
            {plan.days_count === 1 ? 'Day' : 'Days'}
          </span>
        </div>
        <p className="text-[10.5px] text-[#526174] mt-0.5">ELD sheets generated</p>
      </div>

      {/* 5. Cycle Remaining - Green */}
      <div className="bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#16A34A]" />
        <div className="flex items-center justify-between text-[#526174] mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-[0.06em]">70-Hr Clock</span>
          <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
        </div>
        <div className="font-mono text-[20px] font-extrabold text-[#172033]">
          {plan.cycle_remaining_hours.toFixed(1)}
          <span className="text-[11px] font-semibold text-[#526174] ml-1 font-sans">hrs left</span>
        </div>
        <p className="text-[10.5px] text-[#526174] mt-0.5">Used: {plan.final_cycle_used.toFixed(1)}h</p>
      </div>

      {/* 6. Mandatory Stops - Teal */}
      <div className="bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#0F9F8F]" />
        <div className="flex items-center justify-between text-[#526174] mb-1.5">
          <span className="text-[10px] uppercase font-bold tracking-[0.06em]">Mandatory Stops</span>
          <div className="w-6 h-6 rounded-md bg-[#F0FDFA] flex items-center justify-center">
            <Coffee className="w-3.5 h-3.5 text-[#0F9F8F]" />
          </div>
        </div>
        <div className="font-mono text-[20px] font-extrabold text-[#172033]">
          {plan.stops.length}
          <span className="text-[11px] font-semibold text-[#526174] ml-1 font-sans">stops</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#526174] mt-0.5">
          <span className="text-[#D97706] font-semibold">{plan.counts.fuel_stops}F</span>
          <span>•</span>
          <span className="text-[#0891B2] font-semibold">{plan.counts.rest_30_min}B</span>
          <span>•</span>
          <span className="text-[#16A34A] font-semibold">{plan.counts.rest_10_hr}R</span>
        </div>
      </div>
    </div>
  );
};

