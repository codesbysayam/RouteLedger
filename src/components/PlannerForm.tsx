import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint, PlanningSettings, CarrierInfo } from '../types.ts';
import { searchLocations } from '../services/api.ts';
import {
  MapPin,
  Clock,
  Settings,
  Shield,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Sliders,
  FileText,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface PlannerFormProps {
  onPlanTrip: (payload: {
    origin: string;
    pickup: string;
    destination: string;
    current_cycle_used: number;
    departure_time: string;
    carrier_info: CarrierInfo;
    settings: PlanningSettings;
  }) => Promise<void>;
  isLoading: boolean;
  onLoadExample: () => void;
}

export const PlannerForm: React.FC<PlannerFormProps> = ({
  onPlanTrip,
  isLoading,
  onLoadExample,
}) => {
  const [origin, setOrigin] = useState('Richmond, VA');
  const [pickup, setPickup] = useState('Richmond, VA');
  const [destination, setDestination] = useState('Newark, NJ');
  const [currentCycleUsed, setCurrentCycleUsed] = useState<number>(0.0);
  const [departureTime, setDepartureTime] = useState('06:00');

  // Carrier & Driver Info
  const [carrierInfo, setCarrierInfo] = useState<CarrierInfo>({
    carrier_name: 'Apex Freight Systems LLC',
    main_office: '4200 Logistics Blvd, Richmond, VA 23230',
    home_terminal: 'Richmond Terminal, VA',
    driver_name: 'John R. Miller',
    vehicle_number: 'TRK-4089',
    trailer_number: 'TLR-8821',
    shipping_doc: 'BOL-77341 / Auto Parts & Freight',
    co_driver: 'Solo Driver',
  });

  // Regulatory Settings
  const [settings, setSettings] = useState<PlanningSettings>({
    departure_time: '06:00',
    pickup_duration_hours: 1.0,
    dropoff_duration_hours: 1.0,
    fuel_interval_miles: 1000.0,
    fuel_duration_hours: 0.5,
    break_duration_hours: 0.5,
    daily_driving_limit_hours: 11.0,
    daily_duty_window_hours: 14.0,
    cycle_limit_hours: 70.0,
    qualifying_rest_hours: 10.0,
    restart_duration_hours: 34.0,
    allow_sleeper_berth: false,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCarrier, setShowCarrier] = useState(false);

  // Autocomplete Suggestions
  const [originSuggestions, setOriginSuggestions] = useState<LocationPoint[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationPoint[]>([]);
  const [activeInput, setActiveInput] = useState<'origin' | 'dest' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (query: string, field: 'origin' | 'dest') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query || query.length < 3) {
      if (field === 'origin') setOriginSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const results = await searchLocations(query, 4);
      if (field === 'origin') setOriginSuggestions(results);
      else setDestSuggestions(results);
    }, 350);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    await onPlanTrip({
      origin: origin.trim(),
      pickup: (pickup.trim() || origin.trim()),
      destination: destination.trim(),
      current_cycle_used: Number(currentCycleUsed) || 0,
      departure_time: departureTime,
      carrier_info: carrierInfo,
      settings,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Trip Planner & Dispatch Parameters</span>
          </h2>
          <p className="text-xs text-slate-500">
            Enter origin, cargo points, and driver current cycle hours
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadExample}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition flex items-center gap-1 border border-blue-200"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Load Example</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin Location */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Current Location (Starting Terminal / City)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="input-origin"
              type="text"
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                handleSearch(e.target.value, 'origin');
              }}
              onFocus={() => setActiveInput('origin')}
              onBlur={() => setTimeout(() => setActiveInput(null), 250)}
              placeholder="e.g. Richmond, VA or Dallas, TX"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          {/* Autocomplete Dropdown */}
          {activeInput === 'origin' && originSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden text-xs divide-y divide-slate-100">
              {originSuggestions.map((s, idx) => (
                <div
                  key={`orig-sug-${idx}`}
                  onMouseDown={() => {
                    setOrigin(s.display_name);
                    setPickup(s.display_name);
                    setOriginSuggestions([]);
                  }}
                  className="p-2.5 hover:bg-blue-50 cursor-pointer text-slate-700"
                >
                  <p className="font-semibold text-slate-900">{s.display_name.split(',')[0]}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.display_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pickup Location (Cargo Loading)
          </label>
          <div className="relative">
            <Truck className="absolute left-3 top-2.5 w-4 h-4 text-indigo-500" />
            <input
              id="input-pickup"
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Leave identical if cargo is loaded at origin"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Adds 1.0 hour On-Duty (Not Driving) for loading & pre-trip freight securement inspection
          </span>
        </div>

        {/* Destination Location */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Destination Location (Receiver / Delivery)
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-emerald-600" />
            <input
              id="input-destination"
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                handleSearch(e.target.value, 'dest');
              }}
              onFocus={() => setActiveInput('dest')}
              onBlur={() => setTimeout(() => setActiveInput(null), 250)}
              placeholder="e.g. Newark, NJ or Los Angeles, CA"
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>

          {/* Autocomplete Dropdown */}
          {activeInput === 'dest' && destSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden text-xs divide-y divide-slate-100">
              {destSuggestions.map((s, idx) => (
                <div
                  key={`dest-sug-${idx}`}
                  onMouseDown={() => {
                    setDestination(s.display_name);
                    setDestSuggestions([]);
                  }}
                  className="p-2.5 hover:bg-blue-50 cursor-pointer text-slate-700"
                >
                  <p className="font-semibold text-slate-900">{s.display_name.split(',')[0]}</p>
                  <p className="text-[11px] text-slate-500 truncate">{s.display_name}</p>
                </div>
              ))}
            </div>
          )}
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Adds 1.0 hour On-Duty (Not Driving) for unloading & delivery receipt signoff
          </span>
        </div>

        {/* Current Cycle & Departure Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Current Cycle Hours */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Current Cycle Used
              </label>
              <span className="font-bold text-xs text-blue-700">
                {currentCycleUsed.toFixed(1)} / 70.0 hrs
              </span>
            </div>
            <input
              id="input-cycle-slider"
              type="range"
              min="0"
              max="70"
              step="0.5"
              value={currentCycleUsed}
              onChange={(e) => setCurrentCycleUsed(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
              <span>0h (Fresh restart)</span>
              <span>35h</span>
              <span>70h (Exhausted)</span>
            </div>
          </div>

          {/* Departure Time */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Scheduled Departure Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                id="input-departure-time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Default 06:00 AM dispatch
            </span>
          </div>
        </div>

        {/* Accordion: Carrier & Equipment Metadata */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCarrier(!showCarrier)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Carrier & ELD Log Sheet Metadata (FMCSA § 395.8)
            </span>
            {showCarrier ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showCarrier && (
            <div className="p-3.5 bg-white border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-0.5">Carrier Name</label>
                <input
                  type="text"
                  value={carrierInfo.carrier_name}
                  onChange={(e) => setCarrierInfo({ ...carrierInfo, carrier_name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-0.5">Driver Name</label>
                <input
                  type="text"
                  value={carrierInfo.driver_name}
                  onChange={(e) => setCarrierInfo({ ...carrierInfo, driver_name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-0.5">Tractor / Truck #</label>
                <input
                  type="text"
                  value={carrierInfo.vehicle_number}
                  onChange={(e) => setCarrierInfo({ ...carrierInfo, vehicle_number: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-0.5">Trailer #</label>
                <input
                  type="text"
                  value={carrierInfo.trailer_number}
                  onChange={(e) => setCarrierInfo({ ...carrierInfo, trailer_number: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-600 mb-0.5">Shipping Documents / BOL</label>
                <input
                  type="text"
                  value={carrierInfo.shipping_doc}
                  onChange={(e) => setCarrierInfo({ ...carrierInfo, shipping_doc: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Accordion: HOS Regulations & Stops Configuration */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              HOS Rules & Mandatory Intervals (Preset to FMCSA)
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showAdvanced && (
            <div className="p-3.5 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 text-[11px]">Fuel Stop Interval</label>
                <input
                  type="number"
                  value={settings.fuel_interval_miles}
                  onChange={(e) => setSettings({ ...settings, fuel_interval_miles: Number(e.target.value) })}
                  className="w-full p-1.5 border border-slate-300 rounded font-mono font-medium"
                />
                <span className="text-[10px] text-slate-400">Miles (Default 1,000)</span>
              </div>
              <div>
                <label className="block text-slate-500 text-[11px]">Daily Driving Limit</label>
                <input
                  type="number"
                  value={settings.daily_driving_limit_hours}
                  readOnly
                  className="w-full p-1.5 border border-slate-200 bg-slate-50 rounded font-mono font-medium text-slate-600"
                />
                <span className="text-[10px] text-slate-400">11.0 hrs FMCSA</span>
              </div>
              <div>
                <label className="block text-slate-500 text-[11px]">Daily Duty Window</label>
                <input
                  type="number"
                  value={settings.daily_duty_window_hours}
                  readOnly
                  className="w-full p-1.5 border border-slate-200 bg-slate-50 rounded font-mono font-medium text-slate-600"
                />
                <span className="text-[10px] text-slate-400">14.0 hrs FMCSA</span>
              </div>
              <div>
                <label className="block text-slate-500 text-[11px]">Rest Break Duration</label>
                <input
                  type="number"
                  value={settings.break_duration_hours}
                  readOnly
                  className="w-full p-1.5 border border-slate-200 bg-slate-50 rounded font-mono font-medium text-slate-600"
                />
                <span className="text-[10px] text-slate-400">0.5 hr (30 mins)</span>
              </div>
              <div>
                <label className="block text-slate-500 text-[11px]">Qualifying Rest</label>
                <input
                  type="number"
                  value={settings.qualifying_rest_hours}
                  readOnly
                  className="w-full p-1.5 border border-slate-200 bg-slate-50 rounded font-mono font-medium text-slate-600"
                />
                <span className="text-[10px] text-slate-400">10.0 hrs off-duty</span>
              </div>
              <div>
                <label className="block text-slate-500 text-[11px]">Cycle Restart</label>
                <input
                  type="number"
                  value={settings.restart_duration_hours}
                  readOnly
                  className="w-full p-1.5 border border-slate-200 bg-slate-50 rounded font-mono font-medium text-slate-600"
                />
                <span className="text-[10px] text-slate-400">34.0 hrs restart</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          id="btn-plan-trip"
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculating Road Route & Simulating HOS Regulations...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Route, Stops & ELD Daily Logs</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
