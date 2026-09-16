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
        borderLeft: 'border-l-[#2563EB]',
        cardBg: 'bg-[#FFFFFF] hover:bg-[#EFF6FF]/60',
        badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        circleBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        label: 'DROPOFF',
      };
    }

    // ORIGIN: Blue (#2563EB) / Cyan (#0891B2)
    if (index === 0 || t.includes('DEPARTURE') || t.includes('ORIGIN')) {
      return {
        borderLeft: 'border-l-[#2563EB]',
        cardBg: 'bg-[#FFFFFF] hover:bg-[#EFF6FF]/60',
        badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        circleBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        label: 'ORIGIN',
      };
    }

    // PICKUP: Indigo badge (#6366F1), tinted background #F3F1FF
    if (t.includes('PICKUP')) {
      return {
        borderLeft: 'border-l-[#6366F1]',
        cardBg: 'bg-[#FFFFFF] hover:bg-[#F3F1FF]/60',
        badgeBg: 'bg-[#F3F1FF] text-[#6366F1] border border-[#DDD6FE]',
        circleBg: 'bg-[#F3F1FF] text-[#6366F1] border border-[#DDD6FE]',
        label: 'PICKUP',
      };
    }

    // FUEL: Amber badge (#D97706), tinted background #FFFBEB
    if (t.includes('FUEL')) {
      return {
        borderLeft: 'border-l-[#D97706]',
        cardBg: 'bg-[#FFFFFF] hover:bg-[#FFFBEB]/60',
        badgeBg: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
        circleBg: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
        label: 'FUEL STOP',
      };
    }

    // 10-HR MANDATORY REST: Green badge (#16A34A), tinted background #EFFBF3
    if (ev.duty_status === DutyStatus.SLEEPER_BERTH || ev.duration_hours >= 9.5) {
      return {
        borderLeft: 'border-l-[#16A34A]',
        cardBg: 'bg-[#FFFFFF] hover:bg-[#EFFBF3]/60',
        badgeBg: 'bg-[#EFFBF3] text-[#16A34A] border border-[#BBF7D0]',
        circleBg: 'bg-[#EFFBF3] text-[#16A34A] border border-[#BBF7D0]',
        label: '10-HR MANDATORY REST',
      };
    }

    // 30-MIN REST BREAK: Cyan badge (#0891B2), tinted background #ECFEFF
    if (ev.duty_status === DutyStatus.OFF_DUTY || t.includes('REST') || t.includes('BREAK')) {
      return {
        borderLeft: 'border-l-[#0891B2]',
        cardBg: 'bg-[#FFFFFF] hover:bg-[#ECFEFF]/60',
        badgeBg: 'bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]',
        circleBg: 'bg-[#ECFEFF] text-[#0891B2] border border-[#A5F3FC]',
        label: '30-MIN REST BREAK',
      };
    }

    // DRIVING: Blue (#2563EB)
    if (ev.duty_status === DutyStatus.DRIVING) {
      return {
        borderLeft: 'border-l-[#2563EB]',
        cardBg: 'bg-[#FFFFFF] hover:bg-[#F8FAFC]',
        badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        circleBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFD5FF]',
        label: 'DRIVING',
      };
    }

    // Default ON-DUTY
    return {
      borderLeft: 'border-l-[#64748B]',
      cardBg: 'bg-[#FFFFFF] hover:bg-[#F8FAFC]',
      badgeBg: 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]',
      circleBg: 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]',
      label: 'ON DUTY',
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
      className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] overflow-hidden select-none shadow-[0_4px_14px_rgba(15,23,42,0.05)] flex flex-col relative"
    >
      {/* 3px Top Accent Line */}
      <div className="h-[3px] w-full bg-[#2563EB] shrink-0" />

      <div className="px-4 py-3 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-[11px] font-bold text-[#2563EB] tracking-[0.08em] uppercase">
              STOP TIMELINE &amp; OPERATIONAL AUDIT
            </span>
          </div>
          <span className="text-[#D9E2EC]">|</span>
          <span className="text-[11px] text-[#526174] font-mono font-semibold bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFD5FF]">
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
              className={`flex items-center justify-between gap-3 text-[13px] px-3.5 py-2.5 rounded-[8px] border border-[#D9E2EC] border-l-4 ${meta.borderLeft} ${meta.cardBg} transition-all duration-150 shadow-xs`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* 24px Tinted Icon Circle */}
                <div
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10.5px] font-bold ${meta.circleBg}`}
                >
                  {idx + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[11.5px] font-bold text-[#172033]">
                      {startTime}–{endTime}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] tracking-wide uppercase ${meta.badgeBg}`}>
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-[#526174] font-medium">
                      ({getDutyLabel(ev.duty_status)})
                    </span>
                  </div>

                  <div className="text-[12.5px] font-semibold text-[#172033] truncate">
                    {ev.location_name}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[12px] font-bold text-[#172033]">
                  {durText}
                </span>
                {ev.miles_covered > 0 && (
                  <div className="font-mono text-[11px] font-semibold text-[#2563EB]">
                    {ev.miles_covered.toFixed(1)} mi
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Row (Bottom) */}
      <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#D9E2EC] flex flex-wrap items-center justify-between gap-2 text-[11.5px] font-medium text-[#526174]">
        <div>
          Total: <span className="font-mono font-bold text-[#2563EB]">{totalDistance.toFixed(1)} mi</span>
        </div>
        <div>
          Drive: <span className="font-mono font-semibold text-[#0891B2]">{totalDriveHours.toFixed(1)}h</span>
        </div>
        <div>
          Breaks: <span className="font-mono font-semibold text-[#16A34A]">{breakCount}</span>
        </div>
        <div>
          Rest: <span className="font-mono font-semibold text-[#6366F1]">{restCount}</span>
        </div>
      </div>
    </div>
  );
};



