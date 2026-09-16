import React, { useState } from 'react';
import { ELDDailyLogSheet } from '../types.ts';
import { ELDLogGraph } from './ELDLogGraph.tsx';
import { FileText, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface ELDLogSheetProps {
  logs: ELDDailyLogSheet[];
}

export const ELDLogSheet: React.FC<ELDLogSheetProps> = ({ logs }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
        <p className="font-medium">No ELD daily logs available yet.</p>
        <p className="text-sm">Plan a commercial trip to generate FMCSA 49 CFR § 395.8 driver log sheets.</p>
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

  return (
    <div className="space-y-6">
      {/* Multi-Day Navigation Tabs */}
      {logs.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 print:hidden">
          {logs.map((log, index) => {
            const isSelected = index === selectedDayIndex;
            return (
              <button
                key={`day-tab-${log.day_number}`}
                onClick={() => setSelectedDayIndex(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-xs whitespace-nowrap transition-all border-b-2 ${
                  isSelected
                    ? 'border-blue-600 bg-white text-blue-700 shadow-sm'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Day {log.day_number}</span>
                <span className="text-[11px] text-slate-400">({log.date})</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                  {log.total_miles_driving_today.toFixed(0)} mi
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* FMCSA Standard Daily Log Sheet Container */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5 sm:p-7 space-y-6 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* FMCSA Official Header Section */}
        <div className="border-b border-slate-300 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                FMCSA 49 CFR § 395.8 COMPLIANT
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Driver's Daily Record of Duty Status (RODS)
              </h2>
            </div>
            <div className="text-right flex items-center gap-3 sm:block">
              <div className="text-xs text-slate-500 font-medium">Log Date</div>
              <div className="text-base font-extrabold text-slate-900">
                {activeLog.date} (Day {activeLog.day_number} of {logs.length})
              </div>
            </div>
          </div>

          {/* Carrier & Equipment Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Name of Motor Carrier</span>
              <span className="font-bold text-slate-800">{activeLog.carrier_name}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Main Office Address</span>
              <span className="font-bold text-slate-800 truncate block" title={activeLog.main_office_address}>
                {activeLog.main_office_address}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Home Terminal</span>
              <span className="font-bold text-slate-800">{activeLog.home_terminal_address}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Miles Driven Today</span>
              <span className="font-extrabold text-blue-700 text-sm">{activeLog.total_miles_driving_today.toFixed(1)} miles</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Driver Name</span>
              <span className="font-bold text-slate-800">{activeLog.driver_name}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Co-Driver Name</span>
              <span className="font-medium text-slate-600">{activeLog.co_driver || 'Solo Driver'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Truck / Tractor No.</span>
              <span className="font-bold text-slate-800">{activeLog.truck_tractor_number}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Trailer No.</span>
              <span className="font-bold text-slate-800">{activeLog.trailer_number}</span>
            </div>

            <div className="col-span-2 sm:col-span-4 bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Shipping Documents / Commodity / Shipper & BOL
                </span>
                <span className="font-bold text-slate-800">{activeLog.shipping_documents}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Hours Status</span>
                <span className={`inline-flex items-center gap-1 font-bold ${Number(sumHours) === 24.0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {Number(sumHours) === 24.0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {sumHours} / 24.0 hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 24-Hour Graph SVG */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-slate-700">
              24-Hour Grid (Midnight to Midnight)
            </span>
            <span>Quarter-hour resolution tick marks</span>
          </div>
          <ELDLogGraph segments={activeLog.graph_segments} totals={activeLog.totals} />
        </div>

        {/* Remarks Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Remarks & Change of Duty Status Log
            </h3>
            <span className="text-xs text-slate-500">
              {activeLog.remarks.length} recorded status events
            </span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="py-2 px-3 text-left w-20">Time</th>
                  <th className="py-2 px-3 text-left w-36">Duty Status</th>
                  <th className="py-2 px-3 text-left w-48">Location (City, State / Mile)</th>
                  <th className="py-2 px-3 text-left">Remark / Activity Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {activeLog.remarks.map((rm, rIdx) => {
                  let badge = 'bg-slate-100 text-slate-800';
                  if (rm.status === 'DRIVING') badge = 'bg-blue-100 text-blue-800 font-semibold';
                  if (rm.status === 'ON_DUTY_NOT_DRIVING') badge = 'bg-amber-100 text-amber-800';
                  if (rm.status === 'OFF_DUTY') badge = 'bg-purple-100 text-purple-800';
                  if (rm.status === 'SLEEPER_BERTH') badge = 'bg-indigo-100 text-indigo-800';

                  return (
                    <tr key={`remark-${rIdx}`} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-mono font-medium text-slate-700">{rm.time}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${badge}`}>
                          {(rm.status || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-800 font-medium">{rm.location}</td>
                      <td className="py-2 px-3 text-slate-600">{rm.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Certification Line */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600 bg-slate-50/60 p-3.5 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="italic">{activeLog.certification_statement}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-slate-700">Digital Signature:</span>
            <span className="font-serif italic font-bold text-slate-900 border-b border-slate-400 pb-0.5 px-2">
              {activeLog.driver_name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
