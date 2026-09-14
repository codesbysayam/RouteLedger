import React from 'react';

export const HOSRulesView: React.FC = () => {
  const sections = [
    {
      title: '11-Hour Driving Limit',
      statute: '49 CFR § 395.3(a)(3)',
      summary:
        'May drive a maximum of 11 hours after 10 consecutive hours off duty.',
      details:
        'All driving is prohibited immediately upon reaching 11 cumulative hours of driving time. Once this threshold is reached, the driver cannot operate a commercial motor vehicle until a qualifying 10 consecutive hours off-duty rest break is completed.',
      exceptions:
        'Adverse Driving Conditions (§ 395.1(b)(1)): Drivers may extend the 11-hour driving limit by up to 2 additional hours in emergency or unforeseen adverse driving conditions.',
      enforcement:
        'RouteLedger automatically halts driving and schedules a 10-hour rest stop prior to exceeding the 11.0-hour mark.',
    },
    {
      title: '14-Hour Driving Window',
      statute: '49 CFR § 395.3(a)(2)',
      summary:
        'May not drive beyond the 14th consecutive hour after coming on duty, following 10 consecutive hours off duty.',
      details:
        'The 14-hour duty window is a continuous, non-pausing clock. Routine off-duty time, meal breaks, and fueling intervals during the work shift do not extend the 14-hour window.',
      exceptions:
        'Adverse Driving Conditions (§ 395.1(b)(1)): The 14-hour window may be extended by up to 2 hours if conditions could not reasonably have been known prior to the shift.',
      enforcement:
        'RouteLedger ensures all driving maneuvers are completed within 14.0 hours from the shift start time.',
    },
    {
      title: '30-Minute Driving Break',
      statute: '49 CFR § 395.3(a)(3)(ii)',
      summary:
        'Driving is not permitted if more than 8 hours of driving time have elapsed without at least a 30-minute interruption in duty status.',
      details:
        'A driver must take an interruption of at least 30 consecutive minutes from driving after 8 cumulative hours of driving. The break may be satisfied by Off-Duty, Sleeper Berth, or On-Duty (Not Driving) time.',
      exceptions:
        'Short-haul exemption (§ 395.1(e)(1)) drivers operating within 150 air-miles are exempt from the 30-minute break requirement.',
      enforcement:
        'RouteLedger places a mandatory 30-minute rest stop along the highway before 8.0 driving hours elapse.',
    },
    {
      title: '60/70-Hour Cumulative Duty Limit',
      statute: '49 CFR § 395.3(b)',
      summary:
        'May not drive after 60/70 hours on duty in 7/8 consecutive days.',
      details:
        'A motor carrier operating 7 days a week cannot permit a driver to drive after being on duty for 70 hours in any period of 8 consecutive days. A 7-day carrier is capped at 60 hours in 7 days.',
      exceptions:
        '34-Hour Restart (§ 395.3(d)): Any 7 or 8 consecutive day period may restart after taking 34 or more consecutive hours off duty.',
      enforcement:
        'RouteLedger tracks cumulative duty hours against the 70-hour / 8-day pool and schedules a 34-hour off-duty restart when the cycle threshold is reached.',
    },
    {
      title: '10-Hour Consecutive Off-Duty Rest',
      statute: '49 CFR § 395.3(a)(1)',
      summary:
        'Drivers must take 10 consecutive hours off duty before starting a new driving period.',
      details:
        'Completion of a full 10-hour rest period resets both the 11-hour driving clock and the 14-hour shift duty window to full capacity.',
      exceptions:
        'Split sleeper berth provision allows dividing required 10 hours into two qualifying periods.',
      enforcement:
        'RouteLedger enforces full 10.0-hour off-duty rest events between consecutive driving days.',
    },
    {
      title: 'Sleeper Berth Provision',
      statute: '49 CFR § 395.1(g)',
      summary:
        'Allows qualifying drivers to split mandatory 10-hour off-duty rest into two periods (8/2 or 7/3 split).',
      details:
        'One period must be at least 7 consecutive hours in the sleeper berth. The second period must be at least 2 consecutive hours in sleeper berth or off-duty. Neither period counts against the 14-hour driving window.',
      exceptions:
        'Tractor must be equipped with an FMCSA-compliant sleeper berth compartment meeting § 393.76 specifications.',
      enforcement:
        'Configurable under Advanced Planning in RouteLedger.',
    },
    {
      title: 'Fuel Stop Logistics Protocol',
      statute: 'Industry Standard Dispatch Protocol',
      summary:
        'Diesel fuel stop scheduled every 1,000 highway miles for Class 8 commercial vehicles.',
      details:
        'Class 8 heavy-duty vehicles with typical 150–300 gallon fuel capacities operating at 6.0–6.8 MPG require scheduled fueling stops. Each stop is recorded as 30 minutes On-Duty Not Driving.',
      exceptions:
        'Custom fuel capacity or alternative fueling intervals can be configured in Advanced Parameters.',
      enforcement:
        'RouteLedger automatically identifies highway points within 1,000 miles to schedule fuel stops without regulatory drift.',
    },
  ];

  return (
    <div id="hos-rulebook-document" className="space-y-4 select-none">
      {/* Header */}
      <div className="bg-white border border-[#E2E6EA] rounded-[10px] px-5 py-4 shadow-none">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-[#5B6470] tracking-wider uppercase">
              STATUTORY REFERENCE HANDBOOK
            </span>
            <div className="w-5 h-[2px] bg-[#0F9D8A] mt-0.5 rounded-full" />
          </div>
          <span className="text-[#D1D5DB] ml-1">|</span>
          <span className="font-mono text-[11px] text-[#5B6470]">FMCSA 49 CFR Part 395</span>
        </div>
        <div className="text-[16px] font-semibold text-[#111827] mt-1">
          HOS Rulebook &amp; Enforcement Criteria
        </div>
        <p className="text-[12px] text-[#5B6470] mt-1">
          Property-carrying commercial motor vehicles operating under Federal Motor Carrier Safety Administration regulations.
        </p>
      </div>

      {/* Technical Reference Sections */}
      <div className="bg-white border border-[#E2E6EA] rounded-[10px] divide-y divide-[#E2E6EA] shadow-none">
        {sections.map((sec, idx) => (
          <div key={idx} className="p-5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[12px] text-[#7A8490] font-semibold">
                  0{idx + 1}
                </span>
                <h3 className="text-[14px] font-semibold text-[#111827]">
                  {sec.title}
                </h3>
              </div>
              <span className="font-mono text-[11px] font-medium text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF] px-2 py-0.5 rounded-full">
                {sec.statute}
              </span>
            </div>

            <p className="text-[13px] font-medium text-[#111827] leading-snug">
              {sec.summary}
            </p>

            <p className="text-[12px] text-[#5B6470] leading-relaxed">
              {sec.details}
            </p>

            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
              <div className="bg-[#F7F8FA] border border-[#E2E6EA] rounded-[6px] p-3">
                <span className="text-[10px] uppercase font-semibold text-[#7A8490] block mb-0.5">
                  Statutory Exception
                </span>
                <span className="text-[#5B6470] text-[11px] leading-relaxed">
                  {sec.exceptions}
                </span>
              </div>

              <div className="bg-[#F7F8FA] border border-[#E2E6EA] rounded-[6px] p-3">
                <span className="text-[10px] uppercase font-semibold text-[#087F70] block mb-0.5">
                  RouteLedger Engine Enforcement
                </span>
                <span className="text-[#5B6470] text-[11px] leading-relaxed">
                  {sec.enforcement}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
