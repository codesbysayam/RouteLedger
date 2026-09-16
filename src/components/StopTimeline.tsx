import React from 'react';
import { TripEvent, StopMarker, DutyStatus } from '../types.ts';
import { Clock, Navigation, MapPin } from 'lucide-react';

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

  const getEventMeta = (ev: TripEvent, index: number) => {
    const t = ev.type?.toUpperCase() || '';

    // DROPOFF / DESTINATION: Blue (#2563EB)
    if (
      t.includes('DROPOFF') ||
      t.includes('DESTINATION') ||
      t.includes('COMPLETE') ||
      (index === events.length - 1 && ev.duty_status === DutyStatus.ON_DUTY_NOT_DRIVING)
    ) {
      return {
        cardBg: 'bg-[#FFFFFF] hover:bg-[#EFF6FF]/60',
        badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        circleBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        label: 'Dropoff',
      };
    }

    // ORIGIN: Blue (#2563EB) / Cyan (#0891B2)
    if (index === 0 || t.includes('DEPARTURE') || t.includes('ORIGIN')) {
      return {
        cardBg: 'bg-[#FFFFFF] hover:bg-[#EFF6FF]/60',
        badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        circleBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        label: 'Origin',
      };
    }

    // PICKUP: Indigo badge (#6366F1), tinted background #F3F1FF
    if (t.includes('PICKUP')) {
      return {
        cardBg: 'bg-[#FFFFFF] hover:bg-[#EFF6FF]/60',
        badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        circleBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        label: 'Pickup',
      };
    }

    // FUEL: Amber badge (#D97706), tinted background #FFFBEB
    if (t.includes('FUEL')) {
      return {
        cardBg: 'bg-[#FFFFFF] hover:bg-[#FFFBEB]/60',
        badgeBg: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
        circleBg: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
        label: 'Fuel Stop',
      };
    }

    // 10-HR MANDATORY REST: Green badge (#16A34A), tinted background #ECFDF5
    if (ev.duty_status === DutyStatus.SLEEPER_BERTH || ev.duration_hours >= 9.5) {
      return {
        cardBg: 'bg-[#FFFFFF] hover:bg-[#ECFDF5]/60',
        badgeBg: 'bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0]',
        circleBg: 'bg-[#ECFDF5] text-[#16A34A] border border-[#A7F3D0]',
        label: '10-Hr Mandatory Rest',
      };
    }

    // 30-MIN REST BREAK: Cyan badge (#0891B2), tinted background #ECFEFF
    if (ev.duty_status === DutyStatus.OFF_DUTY || t.includes('REST') || t.includes('BREAK')) {
      return {
        cardBg: 'bg-[#FFFFFF] hover:bg-[#ECFEFF]/60',
        badgeBg: 'bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]',
        circleBg: 'bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]',
        label: '30-Min Rest Break',
      };
    }

    // DRIVING: Blue (#2563EB)
    if (ev.duty_status === DutyStatus.DRIVING) {
      return {
        cardBg: 'bg-[#FFFFFF] hover:bg-[#F8FAFC]',
        badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        circleBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        label: 'Driving',
      };
    }

    // Default ON-DUTY
    return {
      cardBg: 'bg-[#FFFFFF] hover:bg-[#F8FAFC]',
      badgeBg: 'bg-[#F1F5F9] text-[#526174] border border-[#CBD5E1]',
      circleBg: 'bg-[#F1F5F9] text-[#526174] border border-[#CBD5E1]',
      label: 'On Duty',
    };
  };

  const getDutyLabel = (duty: string) => {
    switch (duty) {
      case DutyStatus.DRIVING:
        return 'Driving';
      case DutyStatus.ON_DUTY_NOT_DRIVING:
        return 'On Duty';
      case DutyStatus.OFF_DUTY:
        return 'Off Duty';
      case DutyStatus.SLEEPER_BERTH:
        return 'Sleeper Berth';
      default:
        return (duty || '').replace(/_/g, ' ');
    }
  };

  // Compute totals for summary row
  const totalDistance = events.reduce((acc, ev) => acc + (ev.miles_covered || 0), 0);
  const totalDriveHours = events
    .filter((ev) => ev.duty_status === DutyStatus.DRIVING)
    .reduce((acc, ev) => acc + ev.duration_hours, 0);
  const breakCount = events.filter(
    (ev) => ev.duty_status === DutyStatus.OFF_DUTY && ev.duration_hours < 9
  ).length;
  const restCount = events.filter(
    (ev) => ev.duty_status === DutyStatus.SLEEPER_BERTH || ev.duration_hours >= 9
  ).length;

  return (
    <div
      id="dispatch-timeline"
      className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl overflow-hidden select-none shadow-xs flex flex-col relative"
    >
      {/* 3px Top Accent Line */}
      <div className="h-[3px] w-full bg-[#2563EB] shrink-0" />

      <div className="px-4 py-3 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-bold text-[#2563EB] tracking-wide uppercase">
              Stop Timeline &amp; Operational Audit
            </span>
          </div>
          <span className="text-[#D9E2EC]">|</span>
          <span className="text-xs text-[#526174] font-mono font-semibold bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFD5FF]">
            {events.length} events
          </span>
        </div>
      </div>

      <div className="p-3.5 max-h-[480px] overflow-y-auto space-y-2.5">
        {events.map((ev, idx) => {
          const meta = getEventMeta(ev, idx);
          const durHrs = Math.floor(ev.duration_hours);
          const durMins = Math.round((ev.duration_hours - durHrs) * 60);
          const durText = durHrs > 0 ? `${durHrs}h ${durMins > 0 ? `${durMins}m` : ''}` : `${durMins}m`;

          const startTime = formatTime(ev.start_time);
          const endTime = formatTime(ev.end_time);

          return (
            <div
              key={ev.id || idx}
              className={`flex items-center justify-between gap-3 text-xs px-3.5 py-2.5 rounded-lg border border-[#D9E2EC] ${meta.cardBg} transition-colors shadow-xs`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* 24px Tinted Icon Circle */}
                <div
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${meta.circleBg}`}
                >
                  {idx + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-xs font-bold text-[#172033]">
                      {startTime}–{endTime}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full tracking-wide ${meta.badgeBg}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-[#526174] font-medium">
                      ({getDutyLabel(ev.duty_status)})
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#172033] truncate">
                    {ev.location_name}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold text-[#172033]">
                  {durText}
                </span>
                {ev.miles_covered > 0 && (
                  <div className="font-mono text-xs font-semibold text-[#2563EB]">
                    {ev.miles_covered.toFixed(1)} mi
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Row (Bottom) */}
      <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#D9E2EC] flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#526174]">
        <div>
          Total: <span className="font-mono font-bold text-[#2563EB]">{totalDistance.toFixed(1)} mi</span>
        </div>
        <div>
          Drive: <span className="font-mono font-semibold text-[#2563EB]">{totalDriveHours.toFixed(1)}h</span>
        </div>
        <div>
          Breaks: <span className="font-mono font-semibold text-[#16A34A]">{breakCount}</span>
        </div>
        <div>
          Rest: <span className="font-mono font-semibold text-[#2563EB]">{restCount}</span>
        </div>
      </div>
    </div>
  );
};



