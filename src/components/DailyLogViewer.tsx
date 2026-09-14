import React, { useState } from 'react';
import { ELDDailyLogSheet } from '../types.ts';
import { ELDLogGraph } from './ELDLogGraph.tsx';
import { Calendar, Printer, FileDown, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DailyLogViewerProps {
  logs: ELDDailyLogSheet[];
  originName?: string;
  destinationName?: string;
}

export const DailyLogViewer: React.FC<DailyLogViewerProps> = ({
  logs,
  originName = 'Origin',
  destinationName = 'Destination',
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!logs || logs.length === 0) {
    return (
      <div className="p-12 text-center text-[#7A8490] bg-white rounded-[8px] border border-[#EAECF0] select-none">
        <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-[#A4ACB5]" />
        <p className="font-semibold text-sm text-[#171A1F]">No Daily Driver Logs Available</p>
        <p className="text-xs text-[#7A8490] mt-1">
          Plan a route in the Trip Planner to generate official FMCSA 49 CFR § 395.8 daily driver log sheets.
        </p>
      </div>
    );
  }

  const activeLog = logs[selectedDayIndex] || logs[0];
  const sumHours = (
    activeLog.totals.off_duty_hours +
    activeLog.totals.sleeper_berth_hours +
    activeLog.totals.driving_hours +
    activeLog.totals.on_duty_not_driving_hours
  ).toFixed(1);

  const isExact24 = Math.abs(Number(sumHours) - 24.0) < 0.05;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="daily-log-workspace" className="space-y-4 select-none">
      {/* Workspace Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#EAECF0] rounded-[8px] px-5 py-3.5 print:hidden">
        <div>
          <div className="text-[11px] font-semibold text-[#7A8490] uppercase tracking-wider mb-0.5">
            Daily Driver Logs
          </div>
          <div className="text-[14px] font-semibold text-[#171A1F]">
            Day {activeLog.day_number} of {logs.length}
            <span className="text-[#A4ACB5] font-normal mx-2">·</span>
            <span className="font-mono text-[13px] text-[#59636E]">
              {originName} → {destinationName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[7px] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#59636E]" />
            <span>Print Sheet</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[7px] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-[#59636E]" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 3-Column Document Workspace: Day Nav (Left) | Sheet (Center) | Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Day Navigation List (2 Cols) */}
        <div className="lg:col-span-2 space-y-1.5 print:hidden">
          <div className="text-[10px] font-semibold text-[#5B6470] uppercase tracking-wider px-1 mb-1">
            Trip Days
          </div>
          {logs.map((log, index) => {
            const isSelected = index === selectedDayIndex;
            return (
              <button
                key={`day-tab-${log.day_number}`}
                onClick={() => setSelectedDayIndex(index)}
                className={`w-full text-left p-3 rounded-[8px] border transition-colors cursor-pointer block ${
                  isSelected
                    ? 'bg-white border-[#0F9D8A] shadow-xs'
                    : 'bg-[#F7F8FA] border-[#E2E6EA] hover:bg-white hover:border-[#D1D5DB]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-semibold ${isSelected ? 'text-[#0F9D8A]' : 'text-[#111827]'}`}>
                    Day {log.day_number}
                  </span>
                  <span className="font-mono text-[11px] text-[#5B6470]">
                    {log.total_miles_driving_today.toFixed(0)} mi
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#7A8490] mt-0.5">
                  {log.date}
                </div>
              </button>
            );
          })}
        </div>

        {/* CENTER: Official FMCSA 49 CFR § 395.8 Document Sheet (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E6EA] rounded-[10px] p-6 shadow-xs space-y-5 print:border-none print:p-0 print:m-0 print:shadow-none">
          {/* Document Title & Date */}
          <div className="border-b border-[#E2E6EA] pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold uppercase text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF] px-2 py-0.5 rounded">
                    49 CFR 395.8
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-[#5B6470] uppercase">
                    OFFICIAL RECORD OF DUTY STATUS
                  </span>
                </div>
                <h2 className="text-[18px] font-bold text-[#111827] mt-1 tracking-tight">
                  DRIVER'S DAILY LOG
                </h2>
                <div className="w-8 h-[2px] bg-[#0F9D8A] mt-1 rounded-full" />
              </div>

              <div className="text-right">
                <div className="text-[10px] text-[#7A8490] uppercase tracking-wider font-semibold">
                  Date
                </div>
                <div className="font-mono text-[15px] font-semibold text-[#111827]">
                  {activeLog.date}
                </div>
              </div>
            </div>

            {/* Carrier & Equipment Metadata Grid: Date, Driver Name, Carrier, Truck / Tractor No., Trailer No. */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[12px]">
              <div className="bg-[#F7F8FA] p-2.5 rounded-[6px] border border-[#E2E6EA]">
                <span className="text-[10px] font-semibold uppercase text-[#7A8490] block">Date</span>
                <span className="font-mono font-medium text-[#111827] block truncate">{activeLog.date}</span>
              </div>
              <div className="bg-[#F7F8FA] p-2.5 rounded-[6px] border border-[#E2E6EA]">
                <span className="text-[10px] font-semibold uppercase text-[#7A8490] block">Driver Name</span>
                <span className="font-medium text-[#111827] block truncate">{activeLog.driver_name}</span>
              </div>
              <div className="bg-[#F7F8FA] p-2.5 rounded-[6px] border border-[#E2E6EA]">
                <span className="text-[10px] font-semibold uppercase text-[#7A8490] block">Carrier</span>
                <span className="font-medium text-[#111827] block truncate">{activeLog.carrier_name}</span>
              </div>
              <div className="bg-[#F7F8FA] p-2.5 rounded-[6px] border border-[#E2E6EA]">
                <span className="text-[10px] font-semibold uppercase text-[#7A8490] block">Truck / Tractor</span>
                <span className="font-mono font-medium text-[#111827] block">{activeLog.truck_tractor_number}</span>
              </div>
              <div className="bg-[#F7F8FA] p-2.5 rounded-[6px] border border-[#E2E6EA]">
                <span className="text-[10px] font-semibold uppercase text-[#7A8490] block">Trailer No.</span>
                <span className="font-mono font-medium text-[#111827] block">{activeLog.trailer_number || 'TR-5301'}</span>
              </div>
            </div>
          </div>

          {/* 24-Hour Graphical Grid Component */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-[#5B6470] uppercase tracking-wider">
                24-Hour Duty Status Grid (Midnight to Midnight)
              </span>
              <span className="font-mono text-[11px] text-[#5B6470]">
                Total: {sumHours} / 24.0 hrs {isExact24 ? '✓' : ''}
              </span>
            </div>
            <div className="border border-[#E2E6EA] rounded-[8px] overflow-hidden bg-white">
              <ELDLogGraph segments={activeLog.graph_segments} totals={activeLog.totals} />
            </div>
          </div>

          {/* Remarks Register Table */}
          <div>
            <div className="text-[10px] font-semibold text-[#5B6470] uppercase tracking-wider mb-2">
              Remarks &amp; Duty Changes Register
            </div>
            <div className="border border-[#E2E6EA] rounded-[8px] overflow-hidden">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="bg-[#FBFCFD] border-b border-[#E2E6EA] text-[10px] font-semibold text-[#7A8490] uppercase">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Remarks / Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6EA] text-[#111827]">
                  {activeLog.remarks.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#F7F8FA]">
                      <td className="py-2 px-3 font-mono text-[11px] text-[#5B6470]">{r.time}</td>
                      <td className="py-2 px-3 font-medium text-[11px]">{r.duty_status.replace(/_/g, ' ')}</td>
                      <td className="py-2 px-3 truncate max-w-[140px] text-[#5B6470]">{r.location}</td>
                      <td className="py-2 px-3 text-[#5B6470]">{r.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver Certification Area */}
          <div className="pt-3 border-t border-[#E2E6EA] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#5B6470]">
            <div>
              <p className="font-medium text-[#111827]">Driver's Certification:</p>
              <p className="text-[10px] text-[#7A8490]">
                I certify that these entries are true, accurate, and in accordance with 49 CFR Part 395.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="border-b border-[#111827] pb-1 px-4 min-w-[140px] text-center font-mono text-[12px] text-[#111827]">
                {activeLog.driver_name}
              </div>
              <div className="text-[10px] font-mono text-[#7A8490]">
                {activeLog.date}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Recap Box Panel (3 Cols) */}
        <div className="lg:col-span-3 space-y-3 print:hidden">
          <div className="bg-white border border-[#E2E6EA] rounded-[10px] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2E6EA] pb-2">
              <span className="text-[10px] font-semibold text-[#5B6470] uppercase tracking-wider">
                HOS RECAP BOX
              </span>
              <span className="font-mono text-[10px] text-[#7A8490]">
                Day {activeLog.day_number}
              </span>
            </div>

            <div className="space-y-3 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="text-[#5B6470]">Driving:</span>
                <span className="font-mono font-semibold text-[#2563EB]">
                  {activeLog.totals.driving_hours.toFixed(1)} hours
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5B6470]">On duty:</span>
                <span className="font-mono font-semibold text-[#111827]">
                  {activeLog.totals.total_on_duty_hours.toFixed(1)} hours
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#5B6470]">Off duty:</span>
                <span className="font-mono font-semibold text-[#5B6470]">
                  {(activeLog.totals.off_duty_hours + activeLog.totals.sleeper_berth_hours).toFixed(1)} hours
                </span>
              </div>

              <div className="pt-2.5 border-t border-[#E2E6EA] flex items-center justify-between">
                <span className="text-[#5B6470] font-medium">Cycle remaining:</span>
                <span className="font-mono font-bold text-[#087F70]">
                  {Math.max(0, 70 - activeLog.cycle_hours_accumulated_7_days).toFixed(1)} hours
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#F7F8FA] border border-[#E2E6EA] rounded-[8px] p-3 text-[11px] text-[#5B6470] space-y-1">
            <div className="font-semibold text-[#111827] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]" />
              FMCSA Inspection Ready
            </div>
            <p className="text-[11px] text-[#7A8490] leading-relaxed">
              Log automatically formatted per CFR § 395.8 requirements for roadside commercial vehicle inspection.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
