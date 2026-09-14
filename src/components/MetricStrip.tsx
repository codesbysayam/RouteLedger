import React from 'react';
import { TripPlan } from '../types.ts';

interface MetricStripProps {
  trip: TripPlan;
}

export const MetricStrip: React.FC<MetricStripProps> = ({ trip }) => {
  const distance = trip.total_distance_miles ?? 0;
  const driveHoursDecimal = trip.total_drive_hours ?? 0;
  const tripDurationDecimal = trip.estimated_total_duration_hours ?? 0;
  const daysCount = trip.days_count ?? trip.daily_logs?.length ?? trip.days?.length ?? 1;
  const fuelStops = trip.counts?.fuel_stops ?? (trip.stops || []).filter((s) => s.stop_type === 'FUEL').length;
  const finalCycleUsed = trip.final_cycle_used ?? 0;
  const cycleRemaining = Math.max(0, 70.0 - finalCycleUsed);

  const totalDriveH = Math.floor(driveHoursDecimal);
  const totalDriveM = Math.round((driveHoursDecimal - totalDriveH) * 60);

  const tripH = Math.floor(tripDurationDecimal);
  const tripM = Math.round((tripDurationDecimal - tripH) * 60);

  const isCompliant = trip.is_compliant ?? trip.validation?.compliant ?? true;
  const violationCount = trip.violations?.length ?? trip.validation?.violations?.length ?? 0;

  const metrics = [
    {
      label: 'DISTANCE',
      val: distance.toLocaleString(undefined, { maximumFractionDigits: 1 }),
      unit: 'mi',
    },
    {
      label: 'DRIVING',
      val: `${totalDriveH}h ${totalDriveM}m`,
      unit: '',
    },
    {
      label: 'ELAPSED',
      val: `${tripH}h ${tripM}m`,
      unit: '',
    },
    {
      label: 'DAYS',
      val: `${daysCount}`,
      unit: daysCount === 1 ? 'day' : 'days',
    },
    {
      label: 'FUEL',
      val: `${fuelStops}`,
      unit: fuelStops === 1 ? 'stop' : 'stops',
    },
    {
      label: 'CYCLE REMAINING',
      val: `${cycleRemaining.toFixed(1)}h`,
      unit: 'left',
    },
  ];

  return (
    <div
      id="metric-strip"
      className="bg-white border border-[#E5E7EB] rounded-[8px] flex flex-wrap lg:flex-nowrap items-stretch divide-y lg:divide-y-0 lg:divide-x divide-[#E5E7EB] text-[13px] select-none shadow-none overflow-hidden"
    >
      {/* Metric Segments */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 flex-1 divide-x divide-y sm:divide-y-0 divide-[#E5E7EB]">
        {metrics.map((m, idx) => (
          <div key={idx} className="px-4 py-3 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-[#7A8490] tracking-wider uppercase mb-0.5">
              {m.label}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[18px] font-semibold text-[#111827] tracking-tight">
                {m.val}
              </span>
              {m.unit && (
                <span className="text-[11.5px] text-[#5B6470] font-medium">
                  {m.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Far Right Status Badge */}
      <div className="px-5 py-3 flex items-center justify-between sm:justify-end gap-3 shrink-0 bg-[#FBFCFD] min-w-[160px]">
        <div className="text-[10px] font-semibold text-[#7A8490] tracking-wider uppercase lg:hidden">
          AUDIT STATUS
        </div>
        {isCompliant ? (
          <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]"></span>
            <span>COMPLIANT</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B42318]"></span>
            <span>{violationCount} VIOLATION{violationCount !== 1 ? 'S' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

