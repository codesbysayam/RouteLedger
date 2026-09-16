import React, { useState } from 'react';
import { Check } from 'lucide-react';

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
      <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-xs relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />

        <div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#2563EB] tracking-wide uppercase">
                System &amp; Preferences
              </span>
              <div className="w-5 h-[2px] bg-[#2563EB] mt-0.5 rounded-full" />
            </div>
            <span className="text-[#D9E2EC] ml-1">|</span>
            <span className="font-mono text-xs text-[#526174]">Configuration Profile</span>
          </div>
          <div className="text-base font-bold text-[#172033] mt-1">
            Dispatch Engine Settings
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
        <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl p-5 space-y-3 shadow-xs">
          <div className="border-b border-[#D9E2EC] pb-2">
            <h3 className="text-sm font-bold text-[#172033]">General Logistics</h3>
            <p className="text-xs text-[#526174]">
              Default dispatch values applied when initializing new trip calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Default Home Origin
              </label>
              <input
                type="text"
                value={defaultOrigin}
                onChange={(e) => setDefaultOrigin(e.target.value)}
                className="w-full h-9 px-3 text-xs text-[#172033] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Diesel Fueling Interval (miles)
              </label>
              <input
                type="number"
                step="50"
                value={fuelInterval}
                onChange={(e) => setFuelInterval(Number(e.target.value))}
                className="w-full h-9 px-3 font-mono text-xs font-bold text-[#2563EB] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Mandatory Rest Break (mins)
              </label>
              <input
                type="number"
                step="5"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full h-9 px-3 font-mono text-xs font-bold text-[#2563EB] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* 2. Carrier & Equipment Defaults */}
        <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl p-5 space-y-3 shadow-xs">
          <div className="border-b border-[#D9E2EC] pb-2">
            <h3 className="text-sm font-bold text-[#172033]">Carrier Information</h3>
            <p className="text-xs text-[#526174]">
              Pre-filled in official FMCSA RODS log sheets and exportable inspection documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Motor Carrier Name
              </label>
              <input
                type="text"
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                className="w-full h-9 px-3 text-xs text-[#172033] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Main Corporate Office Address
              </label>
              <input
                type="text"
                value={mainOffice}
                onChange={(e) => setMainOffice(e.target.value)}
                className="w-full h-9 px-3 text-xs text-[#172033] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Home Terminal
              </label>
              <input
                type="text"
                value={homeTerminal}
                onChange={(e) => setHomeTerminal(e.target.value)}
                className="w-full h-9 px-3 text-xs text-[#172033] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Primary Driver Name
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full h-9 px-3 text-xs text-[#172033] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Power Unit / Tractor #
              </label>
              <input
                type="text"
                value={tractorNum}
                onChange={(e) => setTractorNum(e.target.value)}
                className="w-full h-9 px-3 font-mono text-xs font-bold text-[#2563EB] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Trailer Unit #
              </label>
              <input
                type="text"
                value={trailerNum}
                onChange={(e) => setTrailerNum(e.target.value)}
                className="w-full h-9 px-3 font-mono text-xs font-bold text-[#2563EB] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* 3. Compliance Rules */}
        <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl p-5 space-y-3 shadow-xs">
          <div className="border-b border-[#D9E2EC] pb-2">
            <h3 className="text-sm font-bold text-[#172033]">Compliance &amp; Statutory Rules</h3>
            <p className="text-xs text-[#526174]">
              Configure HOS engine audit thresholds under FMCSA 49 CFR Part 395.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Duty Cycle Rule
              </label>
              <select
                value={cycleType}
                onChange={(e) => setCycleType(e.target.value)}
                className="w-full h-9 px-3 text-xs text-[#172033] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="70_8">70-Hour / 8-Day Limit (Every Day Carrier)</option>
                <option value="60_7">60-Hour / 7-Day Limit (Standard 6-Day Carrier)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                Cycle Restart Duration (hours)
              </label>
              <input
                type="number"
                value={restartDuration}
                onChange={(e) => setRestartDuration(Number(e.target.value))}
                className="w-full h-9 px-3 font-mono text-xs font-bold text-[#2563EB] bg-[#FFFFFF] border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="sleeper-toggle"
                checked={enableSleeperBerth}
                onChange={(e) => setEnableSleeperBerth(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] accent-[#2563EB] rounded border-[#CBD5E1] focus:ring-[#2563EB]"
              />
              <label htmlFor="sleeper-toggle" className="text-xs text-[#172033] font-medium cursor-pointer">
                Enable Sleeper Berth Split Provision
              </label>
            </div>
          </div>
        </div>

        {/* 4. Map Preferences */}
        <div className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-xl p-5 space-y-3 shadow-xs">
          <div className="border-b border-[#D9E2EC] pb-2">
            <h3 className="text-sm font-bold text-[#172033]">Map Display Preferences</h3>
            <p className="text-xs text-[#526174]">
              OpenStreetMap tile and viewport presentation settings.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoZoom}
                onChange={(e) => setAutoZoom(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] accent-[#2563EB] rounded border-[#CBD5E1] focus:ring-[#2563EB]"
              />
              <span className="text-xs text-[#172033]">
                Auto-fit bounds to route geometry on dispatch calculation
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showFuelStations}
                onChange={(e) => setShowFuelStations(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] accent-[#2563EB] rounded border-[#CBD5E1] focus:ring-[#2563EB]"
              />
              <span className="text-xs text-[#172033]">
                Display highway fuel stop markers along route corridor
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};

