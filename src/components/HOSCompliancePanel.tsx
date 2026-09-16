import React from 'react';
import { TripPlan } from '../types.ts';
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, Fuel, Coffee, RotateCcw } from 'lucide-react';

interface HOSCompliancePanelProps {
  plan: TripPlan;
}

export const HOSCompliancePanel: React.FC<HOSCompliancePanelProps> = ({ plan }) => {
  const { validation, initial_cycle_used, final_cycle_used } = plan;
  const isCompliant = validation?.compliant ?? true;
  const metrics = validation?.metrics;

  // Peak shift driving hours
  const maxShiftDrive = metrics?.max_shift_driving_hours || 0;
  const drivePct = Math.min(100, (maxShiftDrive / 11.0) * 100);

  // Peak duty window
  const maxWindow = metrics?.max_duty_window_hours || 0;
  const windowPct = Math.min(100, (maxWindow / 14.0) * 100);

  // 70-hr cycle peak
  const peakCycle = metrics?.peak_cycle_hours || final_cycle_used;
  const cyclePct = Math.min(100, (peakCycle / 70.0) * 100);

  // Continuous driving before 30m break
  const maxContinuousDrive = metrics?.max_continuous_driving_before_break || 0;
  const breakPct = Math.min(100, (maxContinuousDrive / 8.0) * 100);

  return (
    <div className="bg-[#FFFFFF] rounded-[10px] border border-[#D9E2EC] shadow-[0_4px_14px_rgba(15,23,42,0.05)] p-5 space-y-5 relative overflow-hidden">
      {/* Top 3px Status Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />

      {/* Compliance Header */}
      <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-4 pt-1">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isCompliant ? 'bg-[#EFFBF3] text-[#16A34A] border border-[#BBF7D0]' : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
            }`}
          >
            {isCompliant ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-[#172033] text-sm sm:text-base">
              HOS Compliance Audit Engine
            </h3>
            <p className="text-xs text-[#526174]">
              FMCSA 49 CFR Part 395 Property-Carrying Driver Regulations
            </p>
          </div>
        </div>

        <div
          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
            isCompliant
              ? 'bg-[#EFFBF3] text-[#15803D] border border-[#BBF7D0]'
              : 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
          }`}
        >
          {isCompliant ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>100% COMPLIANT</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>VIOLATION DETECTED</span>
            </>
          )}
        </div>
      </div>

      {/* Violations Warning if any */}
      {!isCompliant && validation?.violations && validation.violations.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3.5 text-xs text-[#B91C1C] space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
            Audit Flagged {validation.violations.length} Potential Violation(s):
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validation.violations.map((v, i) => (
              <li key={`viol-${i}`}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4 Core HOS Clocks & Progress Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. 11-Hour Driving Gauge */}
        <div className="bg-[#EFF6FF] rounded-lg p-3.5 border border-[#BFD5FF]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#172033] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
              11-Hour Drive Limit
            </span>
            <span className="font-bold font-mono text-[#172033]">
              {maxShiftDrive.toFixed(1)} / 11.0h
            </span>
          </div>
          <div className="w-full bg-[#DBEAFE] h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all ${
                drivePct > 95 ? 'bg-[#DC2626]' : drivePct > 80 ? 'bg-[#D97706]' : 'bg-[#2563EB]'
              }`}
              style={{ width: `${drivePct}%` }}
            />
          </div>
          <span className="text-[10.5px] text-[#526174] block">
            Max single shift driving allowed
          </span>
        </div>

        {/* 2. 14-Hour Duty Window Gauge */}
        <div className="bg-[#F3F1FF] rounded-lg p-3.5 border border-[#DDD6FE]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#172033] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#6366F1]" />
              14-Hour Duty Window
            </span>
            <span className="font-bold font-mono text-[#172033]">
              {maxWindow.toFixed(1)} / 14.0h
            </span>
          </div>
          <div className="w-full bg-[#EDE9FE] h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all ${
                windowPct > 95 ? 'bg-[#DC2626]' : windowPct > 80 ? 'bg-[#D97706]' : 'bg-[#6366F1]'
              }`}
              style={{ width: `${windowPct}%` }}
            />
          </div>
          <span className="text-[10.5px] text-[#526174] block">
            Consecutive daily on-duty window
          </span>
        </div>

        {/* 3. 70-Hour / 8-Day Cycle Gauge */}
        <div className="bg-[#F8FAFC] rounded-lg p-3.5 border border-[#D9E2EC]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#172033] flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-[#0F9F8F]" />
              70-Hour Cycle
            </span>
            <span className="font-bold font-mono text-[#172033]">
              {peakCycle.toFixed(1)} / 70.0h
            </span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all ${
                cyclePct > 95 ? 'bg-[#DC2626]' : cyclePct > 80 ? 'bg-[#D97706]' : 'bg-[#0F9F8F]'
              }`}
              style={{ width: `${cyclePct}%` }}
            />
          </div>
          <span className="text-[10.5px] text-[#526174] block">
            Rolling cycle ({plan.cycle_remaining_hours.toFixed(1)}h remaining)
          </span>
        </div>

        {/* 4. 8-Hour Drive Break Clock */}
        <div className="bg-[#FFFBEB] rounded-lg p-3.5 border border-[#FDE68A]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#172033] flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-[#D97706]" />
              30-Min Rest Rule
            </span>
            <span className="font-bold font-mono text-[#172033]">
              {maxContinuousDrive.toFixed(1)} / 8.0h
            </span>
          </div>
          <div className="w-full bg-[#FEF3C7] h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all ${
                breakPct > 95 ? 'bg-[#DC2626]' : 'bg-[#D97706]'
              }`}
              style={{ width: `${breakPct}%` }}
            />
          </div>
          <span className="text-[10.5px] text-[#526174] block">
            {plan.counts.rest_30_min} break(s) scheduled
          </span>
        </div>
      </div>

      {/* Operational Rules Checklist */}
      <div className="pt-2 border-t border-[#D9E2EC] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#172033]">
          <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <span>1.0h Pickup Load</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#172033]">
          <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <span>1.0h Dropoff Unload</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#172033]">
          <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <span>Fuel every &le;1,000 mi</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#172033]">
          <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <span>30m Break &le;8h Drive</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#172033]">
          <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <span>10h Rest Shifts</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#172033]">
          <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <span>34h Restart Safe</span>
        </div>
      </div>
    </div>
  );
};

