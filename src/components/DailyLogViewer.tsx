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
      <div className="p-12 text-center text-[#526174] bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] select-none shadow-xs">
        <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-[#2563EB]" />
        <p className="font-semibold text-sm text-[#172033]">No Daily Driver Logs Available</p>
        <p className="text-xs text-[#526174] mt-1">
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] px-5 py-3.5 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-[0.08em]">
              DAILY DRIVER LOGS · FMCSA 49 CFR § 395.8
            </span>
          </div>
          <div className="text-[14px] font-bold text-[#172033] flex items-center gap-2">
            <span>Day {activeLog.day_number} of {logs.length}</span>
            <span className="text-[#D9E2EC]">|</span>
            <span className="font-mono text-[13px] text-[#526174]">
              {originName} → {destinationName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#172033] bg-[#F8FAFC] border border-[#D9E2EC] rounded-[6px] hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#526174]" />
            <span>Print Sheet</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[6px] transition-colors cursor-pointer shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5 text-white" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 4-Column Operational Summary with Clean Color Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-[#F1F5F9] border border-[#CBD5E1] rounded-[8px] p-3 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#64748B]" />
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#475569] mb-1">
            OFF DUTY
          </div>
          <div className="font-mono text-[18px] font-bold text-[#172033] leading-tight">
            {activeLog.totals.off_duty_hours.toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Mandatory rest period
          </div>
        </div>

        <div className="bg-[#F3F1FF] border border-[#DDD6FE] rounded-[8px] p-3 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#6366F1]" />
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6366F1] mb-1">
            SLEEPER BERTH
          </div>
          <div className="font-mono text-[18px] font-bold text-[#4338CA] leading-tight">
            {activeLog.totals.sleeper_berth_hours.toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-[#6366F1] mt-1">
            Berth split / rest
          </div>
        </div>

        <div className="bg-[#EFF6FF] border border-[#BFD5FF] rounded-[8px] p-3 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#2563EB]" />
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2563EB] mb-1">
            DRIVING TIME
          </div>
          <div className="font-mono text-[18px] font-bold text-[#1D4ED8] leading-tight">
            {activeLog.totals.driving_hours.toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-[#2563EB] mt-1">
            11-hour limit window
          </div>
        </div>

        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] p-3 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#D97706]" />
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#D97706] mb-1">
            ON DUTY (NOT DRIVING)
          </div>
          <div className="font-mono text-[18px] font-bold text-[#B45309] leading-tight">
            {activeLog.totals.on_duty_not_driving_hours.toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-[#D97706] mt-1">
            Inspection, loading &amp; fuel
          </div>
        </div>
      </div>

      {/* 3-Column Document Workspace: Day Nav (Left) | Sheet (Center) | Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Day Navigation List (2 Cols) */}
        <div className="lg:col-span-2 space-y-2 print:hidden">
          <div className="text-[10.5px] font-bold text-[#2563EB] uppercase tracking-[0.08em] px-1 mb-1 flex items-center justify-between">
            <span>TRIP DAYS</span>
            <span className="font-mono text-[10px] text-[#526174]">{logs.length} Total</span>
          </div>
          {logs.map((log, index) => {
            const isSelected = index === selectedDayIndex;
            return (
              <button
                key={`day-tab-${log.day_number}`}
                onClick={() => setSelectedDayIndex(index)}
                className={`w-full text-left p-3 rounded-[8px] transition-all cursor-pointer block ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                    : 'bg-[#FFFFFF] border border-[#D9E2EC] text-[#172033] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[12.5px] font-bold flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-[#172033]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#2563EB]'}`} />
                    Day {log.day_number}
                  </span>
                  <span className={`font-mono text-[11px] font-semibold ${isSelected ? 'text-white/90' : 'text-[#2563EB]'}`}>
                    {log.total_miles_driving_today.toFixed(0)} mi
                  </span>
                </div>
                <div className={`text-[11px] font-mono mt-0.5 pl-3 ${isSelected ? 'text-white/80' : 'text-[#526174]'}`}>
                  {log.date}
                </div>
              </button>
            );
          })}
        </div>

        {/* CENTER: Official FMCSA 49 CFR § 395.8 Document Sheet (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] p-6 shadow-[0_4px_14px_rgba(15,23,42,0.05)] space-y-5 print:border-none print:p-0 print:m-0 print:shadow-none relative overflow-hidden">
          {/* Top 3px Document Accent Line */}
          <div className="h-[3px] w-full bg-[#2563EB] absolute top-0 left-0 right-0" />

          {/* Document Title & Date */}
          <div className="border-b border-[#D9E2EC] pb-4 pt-1">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#15803D] bg-[#EFFBF3] border border-[#BBF7D0] px-2 py-0.5 rounded">
                    49 CFR 395.8
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#526174] uppercase">
                    OFFICIAL RECORD OF DUTY STATUS
                  </span>
                </div>
                <h2 className="text-[20px] font-bold text-[#172033] mt-1 tracking-tight">
                  DRIVER'S DAILY LOG
                </h2>
                <div className="w-8 h-[2px] bg-[#2563EB] mt-1 rounded-full" />
              </div>

              <div className="text-right">
                <div className="text-[10px] text-[#526174] uppercase tracking-wider font-bold">
                  Date
                </div>
                <div className="font-mono text-[15px] font-bold text-[#172033]">
                  {activeLog.date}
                </div>
              </div>
            </div>

            {/* Carrier & Equipment Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[12px]">
              <div className="bg-[#F8FAFC] p-2.5 rounded-[6px] border border-[#D9E2EC]">
                <span className="text-[10px] font-bold uppercase text-[#526174] block">Date</span>
                <span className="font-mono font-semibold text-[#172033] block truncate">{activeLog.date}</span>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-[6px] border border-[#D9E2EC]">
                <span className="text-[10px] font-bold uppercase text-[#526174] block">Driver Name</span>
                <span className="font-semibold text-[#172033] block truncate">{activeLog.driver_name}</span>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-[6px] border border-[#D9E2EC]">
                <span className="text-[10px] font-bold uppercase text-[#526174] block">Carrier</span>
                <span className="font-semibold text-[#172033] block truncate">{activeLog.carrier_name}</span>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-[6px] border border-[#D9E2EC]">
                <span className="text-[10px] font-bold uppercase text-[#526174] block">Truck / Tractor</span>
                <span className="font-mono font-semibold text-[#2563EB] block">{activeLog.truck_tractor_number}</span>
              </div>
              <div className="bg-[#F8FAFC] p-2.5 rounded-[6px] border border-[#D9E2EC]">
                <span className="text-[10px] font-bold uppercase text-[#526174] block">Trailer No.</span>
                <span className="font-mono font-semibold text-[#172033] block">{activeLog.trailer_number || 'TR-5301'}</span>
              </div>
            </div>
          </div>

          {/* 24-Hour Graphical Grid Component */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                24-Hour Duty Status Grid (Midnight to Midnight)
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#15803D] bg-[#EFFBF3] px-2 py-0.5 rounded border border-[#BBF7D0]">
                Total: {sumHours} / 24.0 hrs {isExact24 ? '✓' : ''}
              </span>
            </div>
            <div className="border border-[#D9E2EC] rounded-[8px] overflow-hidden bg-[#FFFFFF] shadow-xs">
              <ELDLogGraph segments={activeLog.graph_segments} totals={activeLog.totals} />
            </div>
          </div>

          {/* Remarks Register Table */}
          <div>
            <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider mb-2">
              Remarks &amp; Duty Changes Register
            </div>
            <div className="border border-[#D9E2EC] rounded-[8px] overflow-hidden">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-[11px] font-bold text-[#526174] uppercase">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Remarks / Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-[#172033]">
                  {activeLog.remarks.map((r, rIdx) => {
                    const isOdd = rIdx % 2 === 1;
                    const statusStr = (r.status || (r as any).duty_status || '').toString();
                    const descStr = r.description || (r as any).remark || '';

                    let chipClass = 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]';
                    let chipLabel = statusStr ? statusStr.replace(/_/g, ' ') : 'OFF DUTY';
                    if (statusStr === 'DRIVING') {
                      chipClass = 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]';
                      chipLabel = 'D · DRIVING';
                    } else if (statusStr === 'ON_DUTY_NOT_DRIVING') {
                      chipClass = 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
                      chipLabel = 'ON · ON DUTY';
                    } else if (statusStr === 'SLEEPER_BERTH') {
                      chipClass = 'bg-[#F3F1FF] text-[#6366F1] border border-[#DDD6FE]';
                      chipLabel = 'SB · SLEEPER';
                    } else if (statusStr === 'OFF_DUTY') {
                      chipClass = 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]';
                      chipLabel = 'OFF · OFF DUTY';
                    }

                    return (
                      <tr
                        key={rIdx}
                        className={`transition-colors ${isOdd ? 'bg-[#F8FAFC]' : 'bg-[#FFFFFF]'} hover:bg-[#F1F5F9]`}
                      >
                        <td className="py-2 px-3 font-mono text-[11.5px] font-bold text-[#2563EB]">{r.time}</td>
                        <td className="py-2 px-3 font-semibold text-[11px]">
                          <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[10.5px] font-bold ${chipClass}`}>
                            {chipLabel}
                          </span>
                        </td>
                        <td className="py-2 px-3 truncate max-w-[140px] text-[#526174] font-medium">{r.location}</td>
                        <td className="py-2 px-3 text-[#172033]">{descStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver Certification Area */}
          <div className="pt-3 border-t border-[#D9E2EC] flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#526174]">
            <div>
              <p className="font-bold text-[#172033]">Driver's Certification:</p>
              <p className="text-[10.5px] text-[#526174]">
                I certify that these entries are true, accurate, and in accordance with 49 CFR Part 395.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="border-b border-[#D9E2EC] pb-1 px-4 min-w-[140px] text-center font-mono font-bold text-[12px] text-[#2563EB]">
                {activeLog.driver_name}
              </div>
              <div className="text-[10.5px] font-mono text-[#526174]">
                {activeLog.date}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Recap Box Panel (3 Cols) */}
        <div className="lg:col-span-3 space-y-3 print:hidden">
          <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] p-4 space-y-3 shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden">
            {/* Top 2.5px Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#2563EB]" />

            <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-2 pt-1">
              <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                HOS RECAP BOX
              </span>
              <span className="font-mono text-[10.5px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFD5FF]">
                Day {activeLog.day_number}
              </span>
            </div>

            <div className="space-y-2.5 text-[12.5px]">
              <div className="flex items-center justify-between bg-[#EFF6FF] p-2.5 rounded border border-[#BFD5FF]">
                <span className="text-[#2563EB] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  Driving:
                </span>
                <span className="font-mono font-bold text-[#1D4ED8]">
                  {activeLog.totals.driving_hours.toFixed(1)} hrs
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#FFFBEB] p-2.5 rounded border border-[#FDE68A]">
                <span className="text-[#D97706] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                  On duty:
                </span>
                <span className="font-mono font-bold text-[#B45309]">
                  {activeLog.totals.total_on_duty_hours.toFixed(1)} hrs
                </span>
              </div>

              <div className="flex items-center justify-between bg-[#F1F5F9] p-2.5 rounded border border-[#CBD5E1]">
                <span className="text-[#475569] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
                  Off duty:
                </span>
                <span className="font-mono font-semibold text-[#172033]">
                  {(activeLog.totals.off_duty_hours + activeLog.totals.sleeper_berth_hours).toFixed(1)} hrs
                </span>
              </div>

              <div className="pt-2 border-t border-[#D9E2EC] flex items-center justify-between bg-[#EFFBF3] p-2.5 rounded border border-[#BBF7D0]">
                <span className="text-[#15803D] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Cycle remaining:
                </span>
                <span className="font-mono font-bold text-[#15803D]">
                  {Math.max(0, 70 - activeLog.cycle_hours_accumulated_7_days).toFixed(1)} hrs
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#EFFBF3] border border-[#BBF7D0] border-l-4 border-l-[#16A34A] rounded-[8px] p-3 text-[11px] text-[#15803D] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              FMCSA Inspection Ready
            </div>
            <p className="text-[11px] text-[#526174] leading-relaxed">
              Log automatically formatted per CFR § 395.8 requirements for roadside commercial vehicle inspection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

