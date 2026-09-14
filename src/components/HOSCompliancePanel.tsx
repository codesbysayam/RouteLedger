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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Compliance Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isCompliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {isCompliant ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              HOS Compliance Audit Engine
            </h3>
            <p className="text-xs text-slate-500">
              FMCSA 49 CFR Part 395 Property-Carrying Driver Regulations
            </p>
          </div>
        </div>

        <div
          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
            isCompliant
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          {isCompliant ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% COMPLIANT</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>VIOLATION DETECTED</span>
            </>
          )}
        </div>
      </div>

      {/* Violations Warning if any */}
      {!isCompliant && validation?.violations && validation.violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-xs text-red-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
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
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              11-Hour Drive Limit
            </span>
            <span className="font-bold text-slate-900">
              {maxShiftDrive.toFixed(1)} / 11.0h
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all ${
                drivePct > 95 ? 'bg-red-500' : drivePct > 80 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${drivePct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            Max single shift driving allowed
          </span>
        </div>

        {/* 2. 14-Hour Duty Window Gauge */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              14-Hour Duty Window
            </span>
            <span className="font-bold text-slate-900">
              {maxWindow.toFixed(1)} / 14.0h
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all ${
                windowPct > 95 ? 'bg-red-500' : windowPct > 80 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${windowPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            Consecutive daily on-duty window
          </span>
        </div>

        {/* 3. 70-Hour / 8-Day Cycle Gauge */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
              70-Hour Cycle
            </span>
            <span className="font-bold text-slate-900">
              {peakCycle.toFixed(1)} / 70.0h
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all ${
                cyclePct > 95 ? 'bg-red-500' : cyclePct > 80 ? 'bg-amber-500' : 'bg-purple-600'
              }`}
              style={{ width: `${cyclePct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            Rolling cycle ({plan.cycle_remaining_hours.toFixed(1)}h remaining)
          </span>
        </div>

        {/* 4. 8-Hour Drive Break Clock */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              30-Min Rest Rule
            </span>
            <span className="font-bold text-slate-900">
              {maxContinuousDrive.toFixed(1)} / 8.0h
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all ${
                breakPct > 95 ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${breakPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            {plan.counts.rest_30_min} break(s) scheduled
          </span>
        </div>
      </div>

      {/* Operational Rules Checklist */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>1.0h Pickup Load</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>1.0h Dropoff Unload</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Fuel every &le;1,000 mi</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>30m Break &le;8h Drive</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>10h Rest Shifts</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>34h Restart Safe</span>
        </div>
      </div>
    </div>
  );
};
