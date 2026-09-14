import React from 'react';
import { TripPlan } from '../types.ts';
import { ELDLogGraph } from './ELDLogGraph.tsx';

interface PrintViewProps {
  plan: TripPlan;
}

export const PrintView: React.FC<PrintViewProps> = ({ plan }) => {
  return (
    <div className="print-view font-sans text-black">
      {/* Cover / Itinerary Page for Print */}
      <div className="page-break mb-8 p-4 border-b-2 border-black">
        <div className="flex justify-between items-start border-b border-black pb-3 mb-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              Commercial Driver Trip Itinerary & HOS Audit
            </h1>
            <p className="text-xs text-gray-700">
              RouteLedger Compliance Report • FMCSA 49 CFR Part 395
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">Trip ID: {plan.id}</p>
            <p>Generated: {new Date(plan.created_at).toLocaleString()}</p>
            <p className="font-bold text-sm mt-1">STATUS: {plan.compliance_status}</p>
          </div>
        </div>

        {/* Route Summary */}
        <div className="grid grid-cols-3 gap-4 text-xs mb-4 border border-black p-3 bg-gray-50">
          <div>
            <strong className="block text-gray-500 uppercase text-[9px]">Origin Location</strong>
            <span className="font-bold text-sm">{plan.origin.display_name}</span>
          </div>
          <div>
            <strong className="block text-gray-500 uppercase text-[9px]">Pickup Terminal</strong>
            <span className="font-bold text-sm">{plan.pickup.display_name}</span>
          </div>
          <div>
            <strong className="block text-gray-500 uppercase text-[9px]">Destination Receiver</strong>
            <span className="font-bold text-sm">{plan.destination.display_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-xs mb-6">
          <div className="border border-black p-2 text-center">
            <span className="block text-gray-500 uppercase text-[9px]">Total Road Distance</span>
            <span className="font-bold text-base">{plan.total_distance_miles} mi</span>
          </div>
          <div className="border border-black p-2 text-center">
            <span className="block text-gray-500 uppercase text-[9px]">Total Drive Time</span>
            <span className="font-bold text-base">{plan.total_drive_hours} hrs</span>
          </div>
          <div className="border border-black p-2 text-center">
            <span className="block text-gray-500 uppercase text-[9px]">Estimated Duration</span>
            <span className="font-bold text-base">{plan.estimated_total_duration_hours} hrs</span>
          </div>
          <div className="border border-black p-2 text-center">
            <span className="block text-gray-500 uppercase text-[9px]">Total Trip Days</span>
            <span className="font-bold text-base">{plan.days_count} Days</span>
          </div>
        </div>

        {/* Stops & Schedule Itinerary */}
        <h3 className="font-bold text-sm uppercase tracking-wider mb-2 border-b border-black pb-1">
          Scheduled Stops & Regulatory Rest Periods
        </h3>
        <table className="w-full text-left text-xs border border-black mb-6">
          <thead>
            <tr className="bg-gray-200 border-b border-black">
              <th className="p-1.5 border-r border-black">Stop Type</th>
              <th className="p-1.5 border-r border-black">Location</th>
              <th className="p-1.5 border-r border-black">Arrival</th>
              <th className="p-1.5 border-r border-black">Departure</th>
              <th className="p-1.5 border-r border-black">Duration</th>
              <th className="p-1.5">Regulation / Reason</th>
            </tr>
          </thead>
          <tbody>
            {plan.stops.map((s, idx) => (
              <tr key={`print-stop-${idx}`} className="border-b border-gray-300">
                <td className="p-1.5 font-bold border-r border-black">{s.stop_type.replace(/_/g, ' ')}</td>
                <td className="p-1.5 border-r border-black">{s.name}</td>
                <td className="p-1.5 border-r border-black font-mono">{new Date(s.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="p-1.5 border-r border-black font-mono">{new Date(s.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="p-1.5 border-r border-black">{s.duration_minutes} min</td>
                <td className="p-1.5 italic text-gray-800">{s.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Daily RODS Log Sheets (One per calendar day) */}
      {plan.daily_logs.map((log) => (
        <div key={`print-log-day-${log.day_number}`} className="page-break mb-12 p-2 border border-black rounded-xs">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-3">
            <div>
              <h2 className="text-lg font-black uppercase">
                Driver's Daily Log (49 CFR § 395.8)
              </h2>
              <p className="text-[10px] text-gray-700">
                24-Hour Period: {log.date} • Day {log.day_number} of {plan.daily_logs.length}
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">Total Miles Today: {log.total_miles_driving_today.toFixed(1)}</p>
              <p className="text-[10px]">Tractor #{log.truck_tractor_number} | Trailer #{log.trailer_number}</p>
            </div>
          </div>

          {/* Carrier Info */}
          <div className="grid grid-cols-3 gap-2 text-[10.5px] mb-3 border border-black p-2 bg-gray-50">
            <div><strong>Carrier:</strong> {log.carrier_name}</div>
            <div><strong>Main Office:</strong> {log.main_office_address}</div>
            <div><strong>Home Terminal:</strong> {log.home_terminal_address}</div>
            <div><strong>Driver:</strong> {log.driver_name}</div>
            <div><strong>Co-Driver:</strong> {log.co_driver}</div>
            <div><strong>BOL/Commodity:</strong> {log.shipping_documents}</div>
          </div>

          {/* 24-Hour Graph */}
          <div className="mb-4">
            <ELDLogGraph segments={log.graph_segments} totals={log.totals} />
          </div>

          {/* Remarks */}
          <h4 className="font-bold text-xs uppercase mb-1">Remarks & Change of Duty Status</h4>
          <table className="w-full text-left text-[10px] border border-black mb-4">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="p-1 w-16 border-r border-black">Time</th>
                <th className="p-1 w-32 border-r border-black">Duty Status</th>
                <th className="p-1 w-44 border-r border-black">Location</th>
                <th className="p-1">Reason / Description</th>
              </tr>
            </thead>
            <tbody>
              {log.remarks.map((rm, rIdx) => (
                <tr key={`print-rm-${rIdx}`} className="border-b border-gray-300">
                  <td className="p-1 font-mono font-bold border-r border-black">{rm.time}</td>
                  <td className="p-1 border-r border-black">{rm.status.replace(/_/g, ' ')}</td>
                  <td className="p-1 border-r border-black">{rm.location}</td>
                  <td className="p-1">{rm.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature */}
          <div className="border-t border-black pt-2 flex justify-between items-center text-[10px]">
            <span className="italic">{log.certification_statement}</span>
            <div>
              <strong>Driver Signature: </strong>
              <span className="font-serif italic font-bold text-xs border-b border-black px-4">
                {log.driver_name}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
