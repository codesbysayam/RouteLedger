import React from 'react';

export const FleetSpecsView: React.FC = () => {
  return (
    <div id="fleet-specs-view" className="space-y-4 select-none">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl px-5 py-4 shadow-xs relative overflow-hidden">
        {/* 3px Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />

        <div className="flex items-center gap-2 pt-1">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#2563EB] tracking-wide uppercase">
              Equipment &amp; Fleet Registry
            </span>
            <div className="w-5 h-[2px] bg-[#2563EB] mt-0.5 rounded-full" />
          </div>
          <span className="text-[#D9E2EC] ml-1">|</span>
          <span className="font-mono text-xs font-semibold text-[#526174]">TRK-4089 / TLR-8821</span>
        </div>
        <div className="text-lg font-bold text-[#172033] mt-1.5">
          Vehicle &amp; Equipment Specifications
        </div>
        <p className="text-xs text-[#526174] mt-1 leading-relaxed">
          Assigned commercial tractor-trailer equipment profile and physics parameters for the RouteLedger dispatch engine.
        </p>
      </div>

      {/* Main Technical Specifications Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power Unit / Tractor Spec */}
        <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl overflow-hidden shadow-xs relative">
          <div className="h-[3px] w-full bg-[#2563EB]" />
          <div className="px-4 py-3 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC]">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              Power Unit (Tractor)
            </span>
            <span className="font-mono text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#BFD5FF]">
              TRK-4089
            </span>
          </div>

          <div className="p-4">
            <table className="w-full text-xs border-collapse">
              <tbody className="divide-y divide-[#E2E8F0]">
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Make / Model</td>
                  <td className="py-2.5 text-right font-semibold text-[#172033]">
                    Freightliner Cascadia 126
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Cab Configuration</td>
                  <td className="py-2.5 text-right font-semibold text-[#172033]">
                    72" Raised Roof Sleeper Cab
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Fuel Capacity</td>
                  <td className="py-2.5 text-right font-mono font-semibold text-[#2563EB]">
                    300 gal (Dual 150 gal Tanks)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Governed Road Speed</td>
                  <td className="py-2.5 text-right font-mono font-bold text-[#172033]">
                    65.0 mph
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Average Loaded Fuel Economy</td>
                  <td className="py-2.5 text-right font-mono font-semibold text-[#172033]">
                    6.5 MPG
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Fuel Threshold Range</td>
                  <td className="py-2.5 text-right font-mono text-[#D97706] font-bold">
                    1,000 miles safe interval
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">ELD Hardware Interface</td>
                  <td className="py-2.5 text-right text-[#16A34A] font-mono text-xs font-bold">
                    J1939 CAN Bus (Compliant)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trailing Equipment Spec */}
        <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl overflow-hidden shadow-xs relative">
          <div className="h-[3px] w-full bg-[#2563EB]" />
          <div className="px-4 py-3 border-b border-[#D9E2EC] flex items-center justify-between bg-[#F8FAFC]">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              Trailing Equipment
            </span>
            <span className="font-mono text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#BFD5FF]">
              TLR-8821
            </span>
          </div>

          <div className="p-4">
            <table className="w-full text-xs border-collapse">
              <tbody className="divide-y divide-[#E2E8F0]">
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Type</td>
                  <td className="py-2.5 text-right font-semibold text-[#172033]">
                    53ft Dry Freight Van
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Length / Width / Height</td>
                  <td className="py-2.5 text-right font-mono font-semibold text-[#172033]">
                    53' × 102" × 13'6"
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Tare Weight (Empty)</td>
                  <td className="py-2.5 text-right font-mono font-semibold text-[#172033]">
                    14,200 lbs
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Maximum Payload</td>
                  <td className="py-2.5 text-right font-mono font-semibold text-[#172033]">
                    45,000 lbs
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Gross Combination Weight</td>
                  <td className="py-2.5 text-right font-mono font-bold text-[#172033]">
                    80,000 lbs GVWR
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Suspension Type</td>
                  <td className="py-2.5 text-right font-semibold text-[#172033]">
                    Air Ride Tandem Slider
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#526174] font-medium">Inspection Status</td>
                  <td className="py-2.5 text-right text-[#16A34A] font-mono text-xs font-bold">
                    Annual DOT Passed
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

