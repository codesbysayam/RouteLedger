import React from 'react';
import { ELDGraphSegment } from '../types.ts';

interface ELDLogGraphProps {
  segments: ELDGraphSegment[];
  totals: {
    off_duty_hours: number;
    sleeper_berth_hours: number;
    driving_hours: number;
    on_duty_not_driving_hours: number;
    total_on_duty_hours: number;
  };
}

export const ELDLogGraph: React.FC<ELDLogGraphProps> = ({ segments, totals }) => {
  // SVG Coordinate Constants
  const viewBoxWidth = 1000;
  const viewBoxHeight = 220;

  const leftMargin = 180; // space for row titles
  const rightMargin = 85; // space for totals column
  const gridWidth = viewBoxWidth - leftMargin - rightMargin; // 735px
  const gridTop = 32;
  const rowHeight = 36;
  const numRows = 4;
  const gridBottom = gridTop + rowHeight * numRows; // 176px

  const rows = [
    { key: 'OFF_DUTY', label: '1. OFF DUTY', yIndex: 0, color: '#64748B' },
    { key: 'SLEEPER_BERTH', label: '2. SLEEPER BERTH', yIndex: 1, color: '#6366F1' },
    { key: 'DRIVING', label: '3. DRIVING', yIndex: 2, color: '#2563EB' },
    { key: 'ON_DUTY_NOT_DRIVING', label: '4. ON DUTY (NOT DRIVING)', yIndex: 3, color: '#D97706' },
  ];

  // Map duty status to Y pixel coordinate (center of row)
  const getYForStatus = (status: string): number => {
    switch (status) {
      case 'OFF_DUTY':
        return gridTop + rowHeight * 0.5;
      case 'SLEEPER_BERTH':
        return gridTop + rowHeight * 1.5;
      case 'DRIVING':
        return gridTop + rowHeight * 2.5;
      case 'ON_DUTY_NOT_DRIVING':
        return gridTop + rowHeight * 3.5;
      default:
        return gridTop + rowHeight * 0.5;
    }
  };

  const getStrokeForStatus = (status: string): { color: string; width: string } => {
    switch (status) {
      case 'DRIVING':
        return { color: '#2563EB', width: '3' };
      case 'ON_DUTY_NOT_DRIVING':
        return { color: '#D97706', width: '2.5' };
      case 'SLEEPER_BERTH':
        return { color: '#6366F1', width: '2.5' };
      case 'OFF_DUTY':
      default:
        return { color: '#64748B', width: '2' };
    }
  };

  // Convert fraction (0.0 to 1.0) to X pixel coordinate
  const getXForFraction = (frac: number): number => {
    return leftMargin + frac * gridWidth;
  };

  const totalSum = (
    totals.off_duty_hours +
    totals.sleeper_berth_hours +
    totals.driving_hours +
    totals.on_duty_not_driving_hours
  ).toFixed(1);

  return (
    <div className="w-full overflow-x-auto bg-[#FFFFFF] border border-[#D9E2EC] rounded-[8px] p-3 print:border-black print:p-0">
      <div className="min-w-[750px]">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto select-none font-sans text-xs bg-[#FFFFFF]"
        >
          {/* Header Row: Hours (Midnight to Midnight) */}
          {Array.from({ length: 25 }).map((_, hour) => {
            const x = leftMargin + (hour / 24) * gridWidth;
            let hourLabel = '';
            if (hour === 0 || hour === 24) hourLabel = 'Mid';
            else if (hour === 12) hourLabel = 'Noon';
            else if (hour > 12) hourLabel = `${hour - 12}`;
            else hourLabel = `${hour}`;

            return (
              <g key={`hdr-${hour}`}>
                <text
                  x={x}
                  y={gridTop - 10}
                  textAnchor="middle"
                  className="fill-[#64748B] font-mono font-medium text-[10.5px] select-none"
                >
                  {hourLabel}
                </text>
                {/* Full hour vertical line */}
                <line
                  x1={x}
                  y1={gridTop}
                  x2={x}
                  y2={gridBottom}
                  stroke={hour % 6 === 0 ? '#94A3B8' : '#E2E8F0'}
                  strokeWidth={hour % 6 === 0 ? '1.5' : '1'}
                />

                {/* Quarter & Half hour ticks */}
                {hour < 24 && (
                  <>
                    <line
                      x1={x + (0.25 / 24) * gridWidth}
                      y1={gridTop}
                      x2={x + (0.25 / 24) * gridWidth}
                      y2={gridBottom}
                      stroke="#F1F5F9"
                      strokeWidth="0.75"
                      strokeDasharray="2,2"
                    />
                    <line
                      x1={x + (0.5 / 24) * gridWidth}
                      y1={gridTop}
                      x2={x + (0.5 / 24) * gridWidth}
                      y2={gridBottom}
                      stroke="#E2E8F0"
                      strokeWidth="0.8"
                    />
                    <line
                      x1={x + (0.75 / 24) * gridWidth}
                      y1={gridTop}
                      x2={x + (0.75 / 24) * gridWidth}
                      y2={gridBottom}
                      stroke="#F1F5F9"
                      strokeWidth="0.75"
                      strokeDasharray="2,2"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Row Labels & Horizontal Dividers */}
          {rows.map((row, idx) => {
            const y = gridTop + idx * rowHeight;
            return (
              <g key={row.key}>
                {/* Top Border of row */}
                <line
                  x1={0}
                  y1={y}
                  x2={leftMargin + gridWidth + rightMargin}
                  y2={y}
                  stroke={idx === 0 ? '#94A3B8' : '#E2E8F0'}
                  strokeWidth={idx === 0 ? '1.5' : '1'}
                />

                {/* Row Label */}
                <text
                  x={12}
                  y={y + rowHeight * 0.6}
                  className="fill-[#172033] font-mono font-bold text-[11px] select-none"
                >
                  {row.label}
                </text>
              </g>
            );
          })}

          {/* Bottom Grid Border */}
          <line
            x1={0}
            y1={gridBottom}
            x2={leftMargin + gridWidth + rightMargin}
            y2={gridBottom}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Right Totals Header & Column */}
          <text
            x={leftMargin + gridWidth + rightMargin * 0.5}
            y={gridTop - 10}
            textAnchor="middle"
            className="fill-[#64748B] font-semibold text-[10px] uppercase tracking-wider font-mono"
          >
            Total Hrs
          </text>
          <line
            x1={leftMargin + gridWidth}
            y1={gridTop}
            x2={leftMargin + gridWidth + rightMargin}
            y2={gridTop}
            stroke="#D9E2EC"
            strokeWidth="1"
          />
          <line
            x1={leftMargin + gridWidth + rightMargin}
            y1={gridTop}
            x2={leftMargin + gridWidth + rightMargin}
            y2={gridBottom}
            stroke="#D9E2EC"
            strokeWidth="1.5"
          />

          {/* Totals values per row */}
          {[
            totals.off_duty_hours,
            totals.sleeper_berth_hours,
            totals.driving_hours,
            totals.on_duty_not_driving_hours,
          ].map((val, idx) => {
            const y = gridTop + idx * rowHeight;
            return (
              <g key={`tot-${idx}`}>
                <line
                  x1={leftMargin + gridWidth}
                  y1={y + rowHeight}
                  x2={leftMargin + gridWidth + rightMargin}
                  y2={y + rowHeight}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={leftMargin + gridWidth + rightMargin * 0.5}
                  y={y + rowHeight * 0.62}
                  textAnchor="middle"
                  className="fill-[#172033] font-mono font-bold text-xs"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* 24-Hour Total Verification Footer */}
          <g>
            <text
              x={leftMargin + gridWidth - 12}
              y={gridBottom + 20}
              textAnchor="end"
              className="fill-[#526174] font-semibold text-[11px] uppercase tracking-wide font-mono"
            >
              Total Hours (Must Equal 24.0):
            </text>
            <rect
              x={leftMargin + gridWidth + 8}
              y={gridBottom + 6}
              width={rightMargin - 16}
              height={20}
              rx={4}
              fill="#EFFBF3"
              stroke="#BBF7D0"
            />
            <text
              x={leftMargin + gridWidth + rightMargin * 0.5}
              y={gridBottom + 20}
              textAnchor="middle"
              className="fill-[#15803D] font-mono font-bold text-xs"
            >
              {totalSum}
            </text>
          </g>

          {/* Render individual duty segments with color coding */}
          {segments.map((seg, i) => {
            const x1 = getXForFraction(seg.start_fraction);
            const x2 = getXForFraction(seg.end_fraction);
            const y = getYForStatus(seg.duty_status);
            const style = getStrokeForStatus(seg.duty_status);

            const prevSeg = i > 0 ? segments[i - 1] : null;
            const prevY = prevSeg ? getYForStatus(prevSeg.duty_status) : null;

            return (
              <g key={`seg-${i}`}>
                {/* Vertical transition line from previous status */}
                {prevY !== null && prevY !== y && (
                  <line
                    x1={x1}
                    y1={prevY}
                    x2={x1}
                    y2={y}
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="2,2"
                  />
                )}
                {/* Horizontal duty line */}
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={style.color}
                  strokeWidth={style.width}
                  strokeLinecap="square"
                />
                {/* Duty transition node dot */}
                <circle
                  cx={x1}
                  cy={y}
                  r={3.5}
                  fill={style.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

