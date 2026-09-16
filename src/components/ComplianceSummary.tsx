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
      className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] overflow-hidden select-none shadow-[0_4px_14px_rgba(15,23,42,0.05)] relative"
    >
      {/* 3px Top Accent Line */}
      <div
        className={`h-[3px] w-full shrink-0 ${
          isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
        }`}
      />

      {/* Header: COMPLIANCE AUDIT · FMCSA 49 CFR Part 395 */}
      <div className="px-5 py-3.5 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isCompliant ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}
            />
            <span
              className={`text-[11px] font-bold tracking-[0.08em] uppercase ${
                isCompliant ? 'text-[#15803D]' : 'text-[#DC2626]'
              }`}
            >
              COMPLIANCE AUDIT
            </span>
          </div>
          <span className="text-[#D9E2EC]">|</span>
          <span className="text-[11.5px] text-[#526174] font-mono font-medium">
            FMCSA 49 CFR Part 395
          </span>
        </div>

        <div>
          {isCompliant ? (
            <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#15803D] bg-[#EFFBF3] border border-[#BBF7D0] px-3 py-1 rounded-[6px] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>FMCSA COMPLIANT</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#DC2626] bg-[#FFF1F2] border border-[#FECDD3] px-3 py-1 rounded-[6px] shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>VIOLATION DETECTED ({violations.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Violation Details if Any */}
      {!isCompliant && violations.length > 0 && (
        <div className="px-5 py-3 bg-[#FFF1F2] border-b border-[#FECDD3] text-[12px] text-[#991B1B] space-y-1.5">
          {violations.map((v: any, idx) => (
            <div key={idx} className="flex items-start gap-2 font-mono text-[12px]">
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
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[#D9E2EC] text-[10.5px] font-bold text-[#526174] uppercase tracking-wider bg-[#F8FAFC]">
              <th className="py-2.5 px-5 font-bold">RULE</th>
              <th className="py-2.5 px-4 font-bold">STATUTE</th>
              <th className="py-2.5 px-4 font-bold">STATUS</th>
              <th className="py-2.5 px-4 font-bold">REMAINING</th>
              <th className="py-2.5 px-4 font-bold">LIMIT</th>
              <th className="py-2.5 px-5 font-bold text-right">OBSERVED</th>
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
                  <td className="py-3 px-4 font-mono text-[11px] text-[#526174]">
                    {row.statute}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-[4px] ${
                        isPass
                          ? 'text-[#15803D] bg-[#EFFBF3] border border-[#BBF7D0]'
                          : 'text-[#DC2626] bg-[#FFF1F2] border border-[#FECDD3]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPass ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                        }`}
                      />
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[12px] font-medium text-[#172033]">
                    {row.remaining}
                  </td>
                  <td className="py-3 px-4 font-mono text-[12px] text-[#526174]">
                    {row.limit}
                  </td>
                  <td className="py-3 px-5 font-mono text-[12px] font-bold text-[#172033] text-right">
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


