import React from 'react';
import { TripPlan } from '../types.ts';
import { Navigation, Clock, Calendar, Fuel, Coffee, Bed, ArrowRight } from 'lucide-react';

interface RouteSummaryCardsProps {
  plan: TripPlan;
}

export const RouteSummaryCards: React.FC<RouteSummaryCardsProps> = ({ plan }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Distance */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[10.5px] uppercase font-bold tracking-wider">Total Route</span>
          <Navigation className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {plan.total_distance_miles.toLocaleString()}
          <span className="text-xs font-semibold text-slate-500 ml-1">mi</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">Actual road routing</p>
      </div>

      {/* 2. Drive Time */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[10.5px] uppercase font-bold tracking-wider">Drive Time</span>
          <Clock className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {plan.total_drive_hours.toFixed(1)}
          <span className="text-xs font-semibold text-slate-500 ml-1">hrs</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Behind-the-wheel</p>
      </div>

      {/* 3. Total Duration */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[10.5px] uppercase font-bold tracking-wider">Trip Duration</span>
          <Clock className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {plan.estimated_total_duration_hours.toFixed(1)}
          <span className="text-xs font-semibold text-slate-500 ml-1">hrs</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Includes stops & rest</p>
      </div>

      {/* 4. Days Count */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[10.5px] uppercase font-bold tracking-wider">Timeline</span>
          <Calendar className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {plan.days_count}
          <span className="text-xs font-semibold text-slate-500 ml-1">
            {plan.days_count === 1 ? 'Day' : 'Days'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">ELD sheets generated</p>
      </div>

      {/* 5. Cycle Remaining */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[10.5px] uppercase font-bold tracking-wider">70-Hr Clock</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {plan.cycle_remaining_hours.toFixed(1)}
          <span className="text-xs font-semibold text-slate-500 ml-1">hrs left</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Used: {plan.final_cycle_used.toFixed(1)}h</p>
      </div>

      {/* 6. Mandatory Stops */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[10.5px] uppercase font-bold tracking-wider">Mandatory Stops</span>
          <Coffee className="w-4 h-4 text-purple-600" />
        </div>
        <div className="text-xl font-extrabold text-slate-900">
          {plan.stops.length}
          <span className="text-xs font-semibold text-slate-500 ml-1">stops</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
          <span>{plan.counts.fuel_stops}F</span>
          <span>•</span>
          <span>{plan.counts.rest_30_min}B</span>
          <span>•</span>
          <span>{plan.counts.rest_10_hr}R</span>
        </div>
      </div>
    </div>
  );
};
