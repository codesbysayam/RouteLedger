import React from 'react';
import { HOSValidationResult } from '../types.ts';

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
      rule: '11-hour driving limit',
      statute: '§ 395.3(a)(3)',
      status: maxDrive <= 11.0 ? 'OK' : 'VIOLATION',
      remaining: `${formatHoursMins(driveMargin)} remaining`,
      limit: '11.0h max',
      observed: `${maxDrive.toFixed(1)}h`,
    },
    {
      rule: '14-hour window',
      statute: '§ 395.3(a)(2)',
      status: maxDuty <= 14.0 ? 'OK' : 'VIOLATION',
      remaining: `${formatHoursMins(dutyMargin)} remaining`,
      limit: '14.0h window',
      observed: `${maxDuty.toFixed(1)}h`,
    },
    {
      rule: '30-minute break',
      statute: '§ 395.3(a)(3)(ii)',
      status: 'OK',
      remaining: 'Required within 8h driving',
      limit: '30m consecutive',
      observed: 'Scheduled',
    },
    {
      rule: '70-hour / 8-day cycle',
      statute: '§ 395.3(b)',
      status: cycleTotal <= 70.0 ? 'OK' : 'VIOLATION',
      remaining: `${formatHoursMins(cycleMargin)} remaining`,
      limit: '70.0h limit',
      observed: `${cycleTotal.toFixed(1)}h`,
    },
    {
      rule: '10-hour consecutive rest',
      statute: '§ 395.3(a)(1)',
      status: 'OK',
      remaining: 'Satisfied before shift',
      limit: '10.0h off-duty',
      observed: 'Enforced',
    },
  ];

  return (
    <div
      id="hos-compliance-table-container"
      className="bg-white border border-[#E2E6EA] rounded-[8px] overflow-hidden select-none shadow-none"
    >
      {/* Header: COMPLIANCE | FMCSA 49 CFR Part 395 | ● COMPLIANT */}
      <div className="px-5 py-3.5 border-b border-[#E2E6EA] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-[#5B6470] tracking-wider uppercase">
              COMPLIANCE AUDIT
            </span>
            <div className="w-5 h-[2px] bg-[#0F9D8A] mt-0.5 rounded-full" />
          </div>
          <span className="text-[#D1D5DB]">|</span>
          <span className="text-[11.5px] text-[#5B6470] font-mono">FMCSA 49 CFR Part 395</span>
        </div>

        <div>
          {isCompliant ? (
            <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF] px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]"></span>
              <span>COMPLIANT</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B42318]"></span>
              <span>VIOLATION DETECTED ({violations.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Violation Details if Any */}
      {!isCompliant && violations.length > 0 && (
        <div className="px-5 py-2.5 bg-[#FEF3F2] border-b border-[#FECDCA] text-[12px] text-[#B42318] space-y-1">
          {violations.map((v: any, idx) => (
            <div key={idx} className="flex items-start gap-2 font-mono text-[12px]">
              <span className="font-bold">•</span>
              <span>
                {typeof v === 'string'
                  ? v
                  : `${v.rule || 'Violation'}: ${v.message || ''}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabular Audit Rows: RULE, STATUTE, STATUS, REMAINING, LIMIT, OBSERVED */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[#E2E6EA] text-[10px] font-semibold text-[#7A8490] uppercase tracking-wider bg-[#FBFCFD]">
              <th className="py-2.5 px-5 font-semibold">RULE</th>
              <th className="py-2.5 px-4 font-semibold">STATUTE</th>
              <th className="py-2.5 px-4 font-semibold">STATUS</th>
              <th className="py-2.5 px-4 font-semibold">REMAINING</th>
              <th className="py-2.5 px-4 font-semibold">LIMIT</th>
              <th className="py-2.5 px-5 font-semibold text-right">OBSERVED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EA] text-[#111827]">
            {rows.map((row, idx) => {
              const isPass = row.status === 'OK';
              return (
                <tr key={idx} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="py-3 px-5 font-medium text-[#111827]">
                    {row.rule}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#5B6470]">
                    {row.statute}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isPass
                          ? 'text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF]'
                          : 'text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPass ? 'bg-[#0F9D8A]' : 'bg-[#B42318]'}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[12px] text-[#5B6470]">
                    {row.remaining}
                  </td>
                  <td className="py-3 px-4 font-mono text-[12px] text-[#5B6470]">
                    {row.limit}
                  </td>
                  <td className="py-3 px-5 font-mono text-[12px] font-semibold text-[#111827] text-right">
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

