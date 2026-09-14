import React from 'react';
import { TripEvent, StopMarker, DutyStatus } from '../types.ts';

interface StopTimelineProps {
  events: TripEvent[];
  stops: StopMarker[];
}

export const StopTimeline: React.FC<StopTimelineProps> = ({ events }) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  };

  const getDutyColor = (ev: TripEvent) => {
    const t = ev.type?.toUpperCase() || '';
    if (t.includes('DROPOFF') || t.includes('DESTINATION') || t.includes('COMPLETE')) {
      return '#16803C'; // Green arrival
    }
    if (t.includes('PICKUP') || t.includes('DEPARTURE') || t.includes('ORIGIN')) {
      return '#0F9D8A'; // RouteLedger Teal operational
    }
    if (t.includes('FUEL')) {
      return '#B54708'; // Amber fuel
    }
    if (ev.duty_status === DutyStatus.DRIVING) {
      return '#2563EB'; // Blue driving
    }
    if (ev.duty_status === DutyStatus.OFF_DUTY || ev.duty_status === DutyStatus.SLEEPER_BERTH) {
      return '#5B6470'; // Gray rest
    }
    return '#0F9D8A';
  };

  const getDutyLabel = (duty: string) => {
    switch (duty) {
      case DutyStatus.DRIVING:
        return 'Driving';
      case DutyStatus.ON_DUTY_NOT_DRIVING:
        return 'On Duty';
      case DutyStatus.OFF_DUTY:
        return 'Off Duty / Rest';
      case DutyStatus.SLEEPER_BERTH:
        return 'Sleeper Berth';
      default:
        return duty.replace(/_/g, ' ');
    }
  };

  return (
    <div
      id="dispatch-timeline"
      className="bg-white border border-[#E2E6EA] rounded-[8px] overflow-hidden select-none shadow-none"
    >
      <div className="px-4 py-3 border-b border-[#E2E6EA] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-[#5B6470] tracking-wider uppercase">
              DISPATCH TIMELINE
            </span>
            <div className="w-4 h-[2px] bg-[#0F9D8A] mt-0.5 rounded-full" />
          </div>
          <span className="text-[11px] text-[#7A8490] ml-2 font-mono">
            {events.length} events
          </span>
        </div>
      </div>

      <div className="p-4 max-h-[520px] overflow-y-auto">
        <div className="relative pl-6 space-y-3.5 before:absolute before:left-[11px] before:top-2.5 before:bottom-2.5 before:w-[1px] before:bg-[#E2E6EA]">
          {events.map((ev, idx) => {
            const eventColor = getDutyColor(ev);
            const durHrs = Math.floor(ev.duration_hours);
            const durMins = Math.round((ev.duration_hours - durHrs) * 60);
            const durText = durHrs > 0 ? `${durHrs}h ${durMins > 0 ? `${durMins}m` : ''}` : `${durMins}m`;

            const startTime = formatTime(ev.start_time);
            const endTime = formatTime(ev.end_time);

            return (
              <div
                key={ev.id || idx}
                className="relative flex items-start justify-between gap-3 text-[13px] py-0.5"
              >
                {/* Small event marker node */}
                <div
                  className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs"
                  style={{ backgroundColor: eventColor }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[12px] font-semibold text-[#111827]">
                      {startTime}–{endTime}
                    </span>
                    <span className="text-[11px] font-medium text-[#111827]">
                      {ev.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-[#A4ACB5]">·</span>
                    <span className="text-[11px] text-[#5B6470]">
                      {getDutyLabel(ev.duty_status)}
                    </span>
                  </div>

                  <div className="text-[12px] text-[#5B6470] truncate mt-0.5">
                    {ev.location_name}
                  </div>

                  {ev.description && (
                    <div className="text-[11px] text-[#7A8490] mt-0.5 leading-tight">
                      {ev.description}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[12px] font-medium text-[#111827]">
                    {durText}
                  </span>
                  {ev.miles_covered > 0 && (
                    <div className="font-mono text-[11px] text-[#7A8490]">
                      {ev.miles_covered.toFixed(1)} mi
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

