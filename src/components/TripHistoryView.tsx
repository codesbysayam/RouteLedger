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
      <div className="p-12 text-center text-[#7A8490] bg-white rounded-[8px] border border-[#EAECF0] select-none">
        <History className="w-8 h-8 mx-auto mb-2 text-[#A4ACB5]" />
        <p className="font-semibold text-sm text-[#171A1F]">No Saved Trip History</p>
        <p className="text-xs text-[#7A8490] mt-1">
          Planned routes will automatically be recorded here for instant recall and compliance review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      {/* Header */}
      <div className="bg-white border border-[#E2E6EA] rounded-[10px] px-5 py-4 flex items-center justify-between shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-[#5B6470] tracking-wider uppercase">
                TRIP HISTORY &amp; RECORDS
              </span>
              <div className="w-5 h-[2px] bg-[#0F9D8A] mt-0.5 rounded-full" />
            </div>
            <span className="text-[#D1D5DB] ml-1">|</span>
            <span className="font-mono text-[11px] text-[#5B6470]">
              {trips.length} saved records
            </span>
          </div>
          <div className="text-[15px] font-semibold text-[#111827] mt-1">
            Dispatch History
          </div>
        </div>
        <span className="font-mono text-[11px] font-medium text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF] px-3 py-1 rounded-full">
          ACTIVE ARCHIVE
        </span>
      </div>

      {/* Professional Table */}
      <div className="bg-white border border-[#E2E6EA] rounded-[10px] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FBFCFD] border-b border-[#E2E6EA] text-[10px] font-semibold text-[#7A8490] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">TRIP ID</th>
                <th className="py-2.5 px-4 font-semibold">ORIGIN</th>
                <th className="py-2.5 px-4 font-semibold">DESTINATION</th>
                <th className="py-2.5 px-4 font-semibold">DISTANCE</th>
                <th className="py-2.5 px-4 font-semibold">DURATION</th>
                <th className="py-2.5 px-4 font-semibold">DAYS</th>
                <th className="py-2.5 px-4 font-semibold">COMPLIANCE</th>
                <th className="py-2.5 px-4 font-semibold">CREATED</th>
                <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EA] text-[#111827]">
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
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono text-[12px] text-[#59636E]">
                      {tripId}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#171A1F] max-w-[140px] truncate">
                      {originLabel}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#171A1F] max-w-[140px] truncate">
                      {destLabel}
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px]">
                      {distanceMiles.toFixed(1)} mi
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] text-[#59636E]">
                      {hours}h {mins}m
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px]">
                      {daysCount}d
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isCompliant
                            ? 'text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF]'
                            : 'text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isCompliant ? 'bg-[#0F9D8A]' : 'bg-[#B42318]'}`} />
                        {isCompliant ? 'COMPLIANT' : 'VIOLATION'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-[#7A8490]">
                      {createdDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[12px] text-[#2563EB] group-hover:underline font-medium inline-flex items-center gap-0.5">
                        <span>Load</span>
                        <ChevronRight className="w-3 h-3" />
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
