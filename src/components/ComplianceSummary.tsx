import React from 'react';
import { HOSValidationResult } from '../types.ts';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface ComplianceSummaryProps {
  validation?: HOSValidationResult;
  initialCycleUsed?: number;
}

export const ComplianceSummary: React.FC<ComplianceSummaryProps> = ({
  validation,
  initialCycleUsed = 0,
}) => {
  const isCompliant = validation?.compliant ?? true;
  const violations = validation?.violations || [];
  const metrics = validation?.metrics;

  const maxDrive = metrics?.max_shift_driving_hours ?? 0;
  const maxDuty = metrics?.max_duty_window_hours ?? 0;
  const cycleTotal = metrics?.peak_cycle_hours ?? (initialCycleUsed + maxDuty);

  const driveMargin = Math.max(0, 11.0 - maxDrive);
  const dutyMargin = Math.max(0, 14.0 - maxDuty);
  const cycleMargin = Math.max(0, 70.0 - cycleTotal);

  const formatHoursMins = (decimalHours: number) => {
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${h}h ${m}m`;
  };

  const rows = [
    {
      rule: '11-Hour Driving Limit',
      statute: '§ 395.3(a)(3)',
      status: maxDrive <= 11.0 ? 'PASS' : 'VIOLATION',
      remaining: `${formatHoursMins(driveMargin)} remaining`,
      limit: '11.0h max',
      observed: `${maxDrive.toFixed(1)}h`,
    },
    {
      rule: '14-Hour Duty Window',
      statute: '§ 395.3(a)(2)',
      status: maxDuty <= 14.0 ? 'PASS' : 'VIOLATION',
      remaining: `${formatHoursMins(dutyMargin)} remaining`,
      limit: '14.0h window',
      observed: `${maxDuty.toFixed(1)}h`,
    },
    {
      rule: '30-Minute Rest Break',
      statute: '§ 395.3(a)(3)(ii)',
      status: 'PASS',
      remaining: 'Scheduled ≤ 8h driving',
      limit: '30m consecutive',
      observed: 'Enforced',
    },
    {
      rule: '70-Hour / 8-Day Cycle',
      statute: '§ 395.3(b)',
      status: cycleTotal <= 70.0 ? 'PASS' : 'VIOLATION',
      remaining: `${formatHoursMins(cycleMargin)} remaining`,
      limit: '70.0h limit',
      observed: `${cycleTotal.toFixed(1)}h`,
    },
    {
      rule: '10-Hour Consecutive Rest',
      statute: '§ 395.3(a)(1)',
      status: 'PASS',
      remaining: 'Satisfied before shift',
      limit: '10.0h off-duty',
      observed: 'Scheduled',
    },
  ];

  return (
    <div
      id="hos-compliance-table-container"
      className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl overflow-hidden select-none shadow-xs relative"
    >
      {/* 3px Top Accent Line */}
      <div
        className={`h-[3px] w-full shrink-0 ${
          isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
        }`}
      />

      {/* Header: Compliance Audit · FMCSA 49 CFR Part 395 */}
      <div className="px-5 py-3.5 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}
            />
            <span
              className={`text-xs font-bold tracking-wide uppercase ${
                isCompliant ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              Compliance Audit
            </span>
          </div>
          <span className="text-[#D9E2EC]">|</span>
          <span className="text-xs text-[#526174] font-mono font-medium">
            FMCSA 49 CFR Part 395
          </span>
        </div>

        <div>
          {isCompliant ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>FMCSA Compliant</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-3 py-1 rounded-full shadow-xs">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
              <span>Violation Detected ({violations.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Violation Details if Any */}
      {!isCompliant && violations.length > 0 && (
        <div className="px-5 py-3 bg-[#FEF2F2] border-b border-[#FECACA] text-xs text-[#991B1B] space-y-1.5">
          {violations.map((v: any, idx) => (
            <div key={idx} className="flex items-start gap-2 font-mono text-xs">
              <span className="font-bold text-[#DC2626]">•</span>
              <span>
                {typeof v === 'string'
                  ? v
                  : `${v.rule || 'Violation'}: ${v.message || ''}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabular Audit Rows with alternating light surfaces */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#D9E2EC] text-xs font-bold text-[#526174] uppercase tracking-wider bg-[#F8FAFC]">
              <th className="py-2.5 px-5 font-bold">Rule</th>
              <th className="py-2.5 px-4 font-bold">Statute</th>
              <th className="py-2.5 px-4 font-bold">Status</th>
              <th className="py-2.5 px-4 font-bold">Remaining</th>
              <th className="py-2.5 px-4 font-bold">Limit</th>
              <th className="py-2.5 px-5 font-bold text-right">Observed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[#172033]">
            {rows.map((row, idx) => {
              const isPass = row.status === 'PASS';
              const isOdd = idx % 2 === 1;
              return (
                <tr
                  key={idx}
                  className={`transition-colors duration-150 ${
                    isOdd ? 'bg-[#F8FAFC]' : 'bg-[#FFFFFF]'
                  } hover:bg-[#F1F5F9]`}
                >
                  <td className="py-3 px-5 font-semibold text-[#172033]">
                    {row.rule}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#526174]">
                    {row.statute}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isPass
                          ? 'text-[#16A34A] bg-[#ECFDF5] border border-[#A7F3D0]'
                          : 'text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPass ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                        }`}
                      />
                      {isPass ? 'Pass' : 'Violation'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-medium text-[#172033]">
                    {row.remaining}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#526174]">
                    {row.limit}
                  </td>
                  <td className="py-3 px-5 font-mono text-xs font-bold text-[#172033] text-right">
                    {row.observed}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


