import React, { useState } from 'react';
import { Check, Sliders } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [saved, setSaved] = useState(false);

  // General Settings
  const [defaultOrigin, setDefaultOrigin] = useState('Richmond, VA');
  const [fuelInterval, setFuelInterval] = useState(1000);
  const [breakDuration, setBreakDuration] = useState(30);

  // Carrier Information
  const [carrierName, setCarrierName] = useState('Apex Freight Systems LLC');
  const [mainOffice, setMainOffice] = useState('4200 Logistics Blvd, Richmond, VA 23230');
  const [homeTerminal, setHomeTerminal] = useState('Richmond Terminal, VA');
  const [driverName, setDriverName] = useState('John R. Miller');
  const [tractorNum, setTractorNum] = useState('TRK-4089');
  const [trailerNum, setTrailerNum] = useState('TLR-8821');

  // Compliance Rules
  const [cycleType, setCycleType] = useState('70_8'); // 70h/8d vs 60h/7d
  const [restartDuration, setRestartDuration] = useState(34);
  const [enableSleeperBerth, setEnableSleeperBerth] = useState(false);

  // Map Preferences
  const [autoZoom, setAutoZoom] = useState(true);
  const [showFuelStations, setShowFuelStations] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form id="settings-view" onSubmit={handleSave} className="space-y-4 select-none">
      {/* Header */}
      <div className="bg-white border border-[#E2E6EA] rounded-[10px] px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-[#5B6470] tracking-wider uppercase">
                SYSTEM &amp; PREFERENCES
              </span>
              <div className="w-5 h-[2px] bg-[#0F9D8A] mt-0.5 rounded-full" />
            </div>
            <span className="text-[#D1D5DB] ml-1">|</span>
            <span className="font-mono text-[11px] text-[#5B6470]">Configuration Profile</span>
          </div>
          <div className="text-[16px] font-semibold text-[#111827] mt-1">
            Dispatch Engine Settings
          </div>
        </div>

        <button
          type="submit"
          className="h-[36px] px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold rounded-[8px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-none"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Saved Preferences</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* 1. General Logistics */}
        <div className="bg-white border border-[#E2E6EA] rounded-[10px] p-5 space-y-3 shadow-none">
          <div className="border-b border-[#E2E6EA] pb-2">
            <h3 className="text-[14px] font-semibold text-[#111827]">General Logistics</h3>
            <p className="text-[12px] text-[#5B6470]">
              Default dispatch values applied when initializing new trip calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Default Home Origin
              </label>
              <input
                type="text"
                value={defaultOrigin}
                onChange={(e) => setDefaultOrigin(e.target.value)}
                className="w-full h-[38px] px-3 text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Diesel Fueling Interval (miles)
              </label>
              <input
                type="number"
                step="50"
                value={fuelInterval}
                onChange={(e) => setFuelInterval(Number(e.target.value))}
                className="w-full h-[38px] px-3 font-mono text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Mandatory Rest Break (mins)
              </label>
              <input
                type="number"
                step="5"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full h-[38px] px-3 font-mono text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>
          </div>
        </div>

        {/* 2. Carrier & Equipment Defaults */}
        <div className="bg-white border border-[#E2E6EA] rounded-[10px] p-5 space-y-3 shadow-none">
          <div className="border-b border-[#E2E6EA] pb-2">
            <h3 className="text-[14px] font-semibold text-[#111827]">Carrier Information</h3>
            <p className="text-[12px] text-[#5B6470]">
              Pre-filled in official FMCSA RODS log sheets and exportable inspection documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Motor Carrier Name
              </label>
              <input
                type="text"
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                className="w-full h-[38px] px-3 text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Main Corporate Office Address
              </label>
              <input
                type="text"
                value={mainOffice}
                onChange={(e) => setMainOffice(e.target.value)}
                className="w-full h-[38px] px-3 text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Home Terminal
              </label>
              <input
                type="text"
                value={homeTerminal}
                onChange={(e) => setHomeTerminal(e.target.value)}
                className="w-full h-[38px] px-3 text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Primary Driver Name
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full h-[38px] px-3 text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Power Unit / Tractor #
              </label>
              <input
                type="text"
                value={tractorNum}
                onChange={(e) => setTractorNum(e.target.value)}
                className="w-full h-[38px] px-3 font-mono text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Trailer Unit #
              </label>
              <input
                type="text"
                value={trailerNum}
                onChange={(e) => setTrailerNum(e.target.value)}
                className="w-full h-[38px] px-3 font-mono text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>
          </div>
        </div>

        {/* 3. Compliance Rules */}
        <div className="bg-white border border-[#E2E6EA] rounded-[10px] p-5 space-y-3 shadow-none">
          <div className="border-b border-[#E2E6EA] pb-2">
            <h3 className="text-[14px] font-semibold text-[#111827]">Compliance &amp; Statutory Rules</h3>
            <p className="text-[12px] text-[#5B6470]">
              Configure HOS engine audit thresholds under FMCSA 49 CFR Part 395.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Duty Cycle Rule
              </label>
              <select
                value={cycleType}
                onChange={(e) => setCycleType(e.target.value)}
                className="w-full h-[38px] px-3 text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              >
                <option value="70_8">70-Hour / 8-Day Limit (Every Day Carrier)</option>
                <option value="60_7">60-Hour / 7-Day Limit (Standard 6-Day Carrier)</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
                Cycle Restart Duration (hours)
              </label>
              <input
                type="number"
                value={restartDuration}
                onChange={(e) => setRestartDuration(Number(e.target.value))}
                className="w-full h-[38px] px-3 font-mono text-[13px] text-[#111827] bg-white border border-[#E2E6EA] rounded-[8px] focus:outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="sleeper-toggle"
                checked={enableSleeperBerth}
                onChange={(e) => setEnableSleeperBerth(e.target.checked)}
                className="w-4 h-4 text-[#0F9D8A] accent-[#0F9D8A] rounded border-[#E2E6EA] focus:ring-[#0F9D8A]"
              />
              <label htmlFor="sleeper-toggle" className="text-[13px] text-[#111827] font-medium cursor-pointer">
                Enable Sleeper Berth Split Provision
              </label>
            </div>
          </div>
        </div>

        {/* 4. Map Preferences */}
        <div className="bg-white border border-[#E2E6EA] rounded-[10px] p-5 space-y-3 shadow-none">
          <div className="border-b border-[#E2E6EA] pb-2">
            <h3 className="text-[14px] font-semibold text-[#111827]">Map Display Preferences</h3>
            <p className="text-[12px] text-[#5B6470]">
              OpenStreetMap tile and viewport presentation settings.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoZoom}
                onChange={(e) => setAutoZoom(e.target.checked)}
                className="w-4 h-4 text-[#0F9D8A] accent-[#0F9D8A] rounded border-[#E2E6EA] focus:ring-[#0F9D8A]"
              />
              <span className="text-[13px] text-[#111827]">
                Auto-fit bounds to route geometry on dispatch calculation
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showFuelStations}
                onChange={(e) => setShowFuelStations(e.target.checked)}
                className="w-4 h-4 text-[#0F9D8A] accent-[#0F9D8A] rounded border-[#E2E6EA] focus:ring-[#0F9D8A]"
              />
              <span className="text-[13px] text-[#111827]">
                Display highway fuel stop markers along route corridor
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
