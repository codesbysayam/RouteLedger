import React from 'react';

export const FleetSpecsView: React.FC = () => {
  return (
    <div id="fleet-specs-view" className="space-y-4 select-none">
      {/* Header */}
      <div className="bg-white border border-[#E2E6EA] rounded-[10px] px-5 py-4 shadow-none">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-[#5B6470] tracking-wider uppercase">
              EQUIPMENT &amp; FLEET REGISTRY
            </span>
            <div className="w-5 h-[2px] bg-[#0F9D8A] mt-0.5 rounded-full" />
          </div>
          <span className="text-[#D1D5DB] ml-1">|</span>
          <span className="font-mono text-[11px] text-[#5B6470]">TRK-4089 / TLR-8821</span>
        </div>
        <div className="text-[16px] font-semibold text-[#111827] mt-1">
          Vehicle &amp; Equipment Specifications
        </div>
        <p className="text-[12px] text-[#5B6470] mt-1">
          Assigned commercial tractor-trailer equipment profile and physics parameters for the RouteLedger dispatch engine.
        </p>
      </div>

      {/* Main Technical Specifications Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power Unit / Tractor Spec */}
        <div className="bg-white border border-[#E2E6EA] rounded-[10px] overflow-hidden shadow-none">
          <div className="px-4 py-3 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FBFCFD]">
            <span className="text-[10px] font-semibold text-[#5B6470] uppercase tracking-wider">
              POWER UNIT (TRACTOR)
            </span>
            <span className="font-mono text-[12px] font-semibold text-[#111827]">
              TRK-4089
            </span>
          </div>

          <div className="p-4">
            <table className="w-full text-[13px] border-collapse">
              <tbody className="divide-y divide-[#E2E6EA]">
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Make / Model</td>
                  <td className="py-2.5 text-right font-medium text-[#111827]">
                    Freightliner Cascadia 126
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Cab Configuration</td>
                  <td className="py-2.5 text-right font-medium text-[#111827]">
                    72" Raised Roof Sleeper Cab
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Fuel Capacity</td>
                  <td className="py-2.5 text-right font-mono text-[#111827]">
                    300 gal (Dual 150 gal Tanks)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Governed Road Speed</td>
                  <td className="py-2.5 text-right font-mono text-[#111827]">
                    65.0 mph
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Average Loaded Fuel Economy</td>
                  <td className="py-2.5 text-right font-mono text-[#111827]">
                    6.5 MPG
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Fuel Threshold Range</td>
                  <td className="py-2.5 text-right font-mono text-[#2563EB] font-medium">
                    1,000 miles safe interval
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">ELD Hardware Interface</td>
                  <td className="py-2.5 text-right text-[#087F70] font-mono text-[12px] font-medium">
                    J1939 CAN Bus (Compliant)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trailing Equipment Spec */}
        <div className="bg-white border border-[#E2E6EA] rounded-[10px] overflow-hidden shadow-none">
          <div className="px-4 py-3 border-b border-[#E2E6EA] flex items-center justify-between bg-[#FBFCFD]">
            <span className="text-[10px] font-semibold text-[#5B6470] uppercase tracking-wider">
              TRAILING EQUIPMENT
            </span>
            <span className="font-mono text-[12px] font-semibold text-[#111827]">
              TLR-8821
            </span>
          </div>

          <div className="p-4">
            <table className="w-full text-[13px] border-collapse">
              <tbody className="divide-y divide-[#E2E6EA]">
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Type</td>
                  <td className="py-2.5 text-right font-medium text-[#111827]">
                    53ft Dry Freight Van
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Length / Width / Height</td>
                  <td className="py-2.5 text-right font-mono text-[#111827]">
                    53' × 102" × 13'6"
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Tare Weight (Empty)</td>
                  <td className="py-2.5 text-right font-mono text-[#111827]">
                    14,200 lbs
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Maximum Payload</td>
                  <td className="py-2.5 text-right font-mono text-[#111827]">
                    45,000 lbs
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Gross Combination Weight</td>
                  <td className="py-2.5 text-right font-mono text-[#111827]">
                    80,000 lbs GVWR
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Suspension Type</td>
                  <td className="py-2.5 text-right text-[#111827]">
                    Air Ride Tandem Slider
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-[#5B6470]">Inspection Status</td>
                  <td className="py-2.5 text-right text-[#087F70] font-mono text-[12px] font-medium">
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
