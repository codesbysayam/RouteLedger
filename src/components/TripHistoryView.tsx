import React from 'react';
import { TripPlan } from '../types.ts';
import { History, ChevronRight } from 'lucide-react';

interface TripHistoryViewProps {
  trips: TripPlan[];
  onSelectTrip: (trip: TripPlan) => void;
}

export const TripHistoryView: React.FC<TripHistoryViewProps> = ({ trips, onSelectTrip }) => {
  if (!trips || trips.length === 0) {
    return (
      <div className="p-12 text-center text-[#526174] bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] select-none shadow-xs">
        <History className="w-8 h-8 mx-auto mb-2 text-[#2563EB]" />
        <p className="font-semibold text-sm text-[#172033]">No Saved Trip History</p>
        <p className="text-xs text-[#526174] mt-1">
          Planned routes will automatically be recorded here for instant recall and compliance review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] px-5 py-4 flex items-center justify-between shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />

        <div className="pt-0.5">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#2563EB] tracking-[0.06em] uppercase">
                TRIP HISTORY &amp; RECORDS
              </span>
              <div className="w-5 h-[2px] bg-[#2563EB] mt-0.5 rounded-full" />
            </div>
            <span className="text-[#D9E2EC] ml-1">|</span>
            <span className="font-mono text-[11.5px] font-semibold text-[#526174]">
              {trips.length} saved records
            </span>
          </div>
          <div className="text-[16px] font-bold text-[#172033] mt-1">
            Dispatch History Archive
          </div>
        </div>
        <span className="font-mono text-[11px] font-bold text-[#15803D] bg-[#EFFBF3] border border-[#BBF7D0] px-3.5 py-1 rounded-full shadow-xs">
          ACTIVE ARCHIVE
        </span>
      </div>

      {/* Professional Table */}
      <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] overflow-hidden shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-[10.5px] font-bold text-[#526174] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-bold">TRIP ID</th>
                <th className="py-2.5 px-4 font-bold">ORIGIN</th>
                <th className="py-2.5 px-4 font-bold">DESTINATION</th>
                <th className="py-2.5 px-4 font-bold">DISTANCE</th>
                <th className="py-2.5 px-4 font-bold">DURATION</th>
                <th className="py-2.5 px-4 font-bold">DAYS</th>
                <th className="py-2.5 px-4 font-bold">COMPLIANCE</th>
                <th className="py-2.5 px-4 font-bold">CREATED</th>
                <th className="py-2.5 px-4 font-bold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#172033]">
              {trips.map((t, idx) => {
                const driveHours = t.total_drive_hours ?? (t as any).metrics?.total_drive_hours ?? 0;
                const distanceMiles = t.total_distance_miles ?? (t as any).metrics?.total_distance_miles ?? 0;
                const hours = Math.floor(driveHours);
                const mins = Math.round((driveHours - hours) * 60);
                const originLabel = t.origin?.city || (t.origin?.display_name ? t.origin.display_name.split(',')[0] : 'Origin');
                const destLabel = t.destination?.city || (t.destination?.display_name ? t.destination.display_name.split(',')[0] : 'Destination');
                const daysCount = t.days_count ?? t.daily_logs?.length ?? t.days?.length ?? 1;
                const isCompliant = t.is_compliant ?? t.validation?.compliant ?? true;
                const tripId = t.id ? t.id.slice(0, 8).toUpperCase() : `TRP-${idx + 101}`;
                const createdDate = t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today';

                return (
                  <tr
                    key={t.id || idx}
                    onClick={() => onSelectTrip(t)}
                    className="hover:bg-[#EFF6FF]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono text-[12px] font-bold text-[#2563EB]">
                      {tripId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#172033] max-w-[140px] truncate">
                      {originLabel}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#172033] max-w-[140px] truncate">
                      {destLabel}
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] font-bold text-[#2563EB]">
                      {distanceMiles.toFixed(1)} mi
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] text-[#526174]">
                      {hours}h {mins}m
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] font-bold text-[#172033]">
                      {daysCount}d
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isCompliant
                            ? 'text-[#15803D] bg-[#EFFBF3] border border-[#BBF7D0]'
                            : 'text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
                        {isCompliant ? 'COMPLIANT' : 'VIOLATION'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[12px] font-mono text-[#526174]">
                      {createdDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[12px] text-[#2563EB] group-hover:text-[#1D4ED8] font-bold inline-flex items-center gap-0.5">
                        <span>Load</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

