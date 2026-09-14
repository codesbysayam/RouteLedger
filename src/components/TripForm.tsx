import React, { useState, useRef, useEffect } from 'react';
import { LocationPoint, PlanningSettings, CarrierInfo } from '../types.ts';
import { searchLocations } from '../services/api.ts';
import {
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Loader2,
  Sliders,
  Building2,
  Route,
} from 'lucide-react';

interface TripFormProps {
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
  onLoadExample?: () => void;
  currentOrigin?: string;
  currentDestination?: string;
}

export const TripForm: React.FC<TripFormProps> = ({
  onPlanTrip,
  isLoading,
  onLoadExample,
  currentOrigin = 'Richmond, VA',
  currentDestination = 'Newark, NJ',
}) => {
  const [origin, setOrigin] = useState(currentOrigin);
  const [pickup, setPickup] = useState(currentOrigin);
  const [destination, setDestination] = useState(currentDestination);
  const [currentCycleUsed, setCurrentCycleUsed] = useState<number>(0.0);
  const [departureTime, setDepartureTime] = useState('06:00');

  // Carrier & Equipment details
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

  // Regulatory & Dispatch constraints
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

  // Autocomplete Suggestions with cache
  const [originSuggestions, setOriginSuggestions] = useState<LocationPoint[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationPoint[]>([]);
  const [activeInput, setActiveInput] = useState<'origin' | 'dest' | null>(null);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);

  const searchCache = useRef<Map<string, LocationPoint[]>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (query: string, field: 'origin' | 'dest') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 3) {
      if (field === 'origin') setOriginSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    if (searchCache.current.has(cleanQuery)) {
      const cached = searchCache.current.get(cleanQuery)!;
      if (field === 'origin') setOriginSuggestions(cached);
      else setDestSuggestions(cached);
      return;
    }

    if (field === 'origin') setIsSearchingOrigin(true);
    else setIsSearchingDest(true);

    timerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(cleanQuery, 4);
        searchCache.current.set(cleanQuery, results);
        if (field === 'origin') setOriginSuggestions(results);
        else setDestSuggestions(results);
      } finally {
        if (field === 'origin') setIsSearchingOrigin(false);
        else setIsSearchingDest(false);
      }
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    await onPlanTrip({
      origin: origin.trim(),
      pickup: pickup.trim() || origin.trim(),
      destination: destination.trim(),
      current_cycle_used: Number(currentCycleUsed) || 0,
      departure_time: departureTime,
      carrier_info: carrierInfo,
      settings,
    });
  };

  const cycleVal = Math.min(70, Math.max(0, Number(currentCycleUsed) || 0));
  const cycleRemaining = Math.max(0, 70 - cycleVal);

  return (
    <form
      id="trip-planner-form"
      onSubmit={handleSubmit}
      className="bg-white border border-[#E5E7EB] rounded-[8px] p-5 sm:p-6 select-none shadow-none"
    >
      {/* Form Section Header */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#F3F4F6]">
        <div>
          <div className="text-[10.5px] font-semibold text-[#5B6470] tracking-wider uppercase flex items-center gap-1.5 mb-0.5">
            <span>PLAN TRIP</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]" />
          </div>
          <p className="text-[13px] text-[#5B6470]">
            Define the trip waypoints and driver availability.
          </p>
        </div>
      </div>

      {/* 3-Step Physical Journey Progression Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-5">
        {/* Origin */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] font-medium text-[#111827] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#111827]" />
              <span>Origin Location</span>
            </label>
            <span className="text-[11px] text-[#7A8490] font-mono">Start point</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                if (pickup === origin) setPickup(e.target.value);
                handleSearch(e.target.value, 'origin');
              }}
              onFocus={() => setActiveInput('origin')}
              onBlur={() => setTimeout(() => setActiveInput(null), 250)}
              placeholder="e.g. Richmond, VA"
              className="w-full h-[44px] px-3.5 text-[14px] text-[#111827] bg-white border border-[#D9DDE3] rounded-[7px] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/12 transition-colors placeholder:text-[#98A2B3]"
            />
            {origin && (
              <button
                type="button"
                onClick={() => {
                  setOrigin('');
                  setOriginSuggestions([]);
                }}
                className="absolute right-3 text-[#7A8490] hover:text-[#111827] p-1 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeInput === 'origin' && originSuggestions.length > 0 && (
            <div className="absolute top-[72px] left-0 right-0 z-30 bg-white border border-[#D9DDE3] rounded-[7px] shadow-md py-1 overflow-hidden">
              {originSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => {
                    setOrigin(item.display_name);
                    if (pickup === origin) setPickup(item.display_name);
                    setOriginSuggestions([]);
                  }}
                  className="w-full text-left px-3.5 py-2 text-[12.5px] text-[#111827] hover:bg-[#F3F4F6] transition-colors truncate block"
                >
                  {item.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pickup Loading Terminal */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] font-medium text-[#111827] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span>Cargo Pickup</span>
            </label>
            <span className="text-[11px] text-[#7A8490] font-mono">Loading dock</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="e.g. Richmond Distribution Center"
              className="w-full h-[44px] px-3.5 text-[14px] text-[#111827] bg-white border border-[#D9DDE3] rounded-[7px] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/12 transition-colors placeholder:text-[#98A2B3]"
            />
            {pickup && (
              <button
                type="button"
                onClick={() => setPickup('')}
                className="absolute right-3 text-[#7A8490] hover:text-[#111827] p-1 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] font-medium text-[#111827] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16803C]" />
              <span>Final Destination</span>
            </label>
            <span className="text-[11px] text-[#7A8490] font-mono">Consignee</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                handleSearch(e.target.value, 'dest');
              }}
              onFocus={() => setActiveInput('dest')}
              onBlur={() => setTimeout(() => setActiveInput(null), 250)}
              placeholder="e.g. Newark, NJ"
              className="w-full h-[44px] px-3.5 text-[14px] text-[#111827] bg-white border border-[#D9DDE3] rounded-[7px] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/12 transition-colors placeholder:text-[#98A2B3]"
            />
            {destination && (
              <button
                type="button"
                onClick={() => {
                  setDestination('');
                  setDestSuggestions([]);
                }}
                className="absolute right-3 text-[#7A8490] hover:text-[#111827] p-1 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeInput === 'dest' && destSuggestions.length > 0 && (
            <div className="absolute top-[72px] left-0 right-0 z-30 bg-white border border-[#D9DDE3] rounded-[7px] shadow-md py-1 overflow-hidden">
              {destSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => {
                    setDestination(item.display_name);
                    setDestSuggestions([]);
                  }}
                  className="w-full text-left px-3.5 py-2 text-[12.5px] text-[#111827] hover:bg-[#F3F4F6] transition-colors truncate block"
                >
                  {item.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Operational Parameters (Departure + Cycle) & Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end mb-2">
        {/* Departure Time (3 cols) */}
        <div className="md:col-span-3">
          <label className="block text-[12px] font-medium text-[#111827] mb-1.5">
            Departure Time
          </label>
          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full h-[44px] px-3.5 text-[13px] font-mono text-[#111827] bg-white border border-[#D9DDE3] rounded-[7px] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/12 transition-colors"
          />
        </div>

        {/* Current Cycle Used with thin progress bar (5 cols) */}
        <div className="md:col-span-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[12px] font-medium text-[#111827]">
              Current Cycle Used
            </label>
            <span className="font-mono text-[11px] text-[#5B6470]">
              {cycleVal.toFixed(1)}h used · <span className="text-[#087F70] font-semibold">{cycleRemaining.toFixed(1)}h left</span>
            </span>
          </div>
          <div className="relative flex flex-col justify-center">
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.5"
                min="0"
                max="70"
                value={currentCycleUsed}
                onChange={(e) => setCurrentCycleUsed(parseFloat(e.target.value) || 0)}
                className="w-full h-[44px] px-3.5 text-[13px] font-mono text-[#111827] bg-white border border-[#D9DDE3] rounded-[7px] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/12 transition-colors"
              />
              <span className="absolute right-3.5 text-[12px] font-mono text-[#7A8490] pointer-events-none">
                / 70.0h
              </span>
            </div>
            {/* Visual thin progress bar */}
            <div className="w-full h-[3px] bg-[#E5E7EB] rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-300 ${
                  cycleVal > 60 ? 'bg-[#B42318]' : cycleVal > 45 ? 'bg-[#B54708]' : 'bg-[#0F9D8A]'
                }`}
                style={{ width: `${Math.min(100, (cycleVal / 70) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Advanced Disclosure Toggle (2 cols) */}
        <div className="md:col-span-2 flex items-center h-[44px] pb-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[#5B6470] hover:text-[#111827] py-2 cursor-pointer transition-colors"
          >
            <span>Advanced options</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Primary Action Button (3 cols) */}
        <div className="md:col-span-3 flex items-center justify-end pb-1">
          <button
            type="submit"
            disabled={isLoading || !origin.trim() || !destination.trim()}
            className="w-full h-[44px] px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13.5px] font-medium rounded-[7px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Planning route...</span>
              </>
            ) : (
              <>
                <Route className="w-4 h-4" />
                <span>Plan route</span>
              </>
            )}
          </button>
        </div>
      </div>


      {/* Expandable Advanced Options Disclosure */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-[#EAECF0] space-y-4">
          {/* Dispatch Constraints */}
          <div>
            <div className="text-[11px] font-semibold text-[#7A8490] tracking-wider uppercase mb-2.5">
              Operating Durations &amp; Intervals
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-[#59636E] mb-1">
                  Pickup Loading (hrs)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={settings.pickup_duration_hours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pickup_duration_hours: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#59636E] mb-1">
                  Dropoff Unloading (hrs)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={settings.dropoff_duration_hours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dropoff_duration_hours: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#59636E] mb-1">
                  Fuel Interval (miles)
                </label>
                <input
                  type="number"
                  step="50"
                  min="200"
                  value={settings.fuel_interval_miles}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fuel_interval_miles: parseFloat(e.target.value) || 1000,
                    })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#59636E] mb-1">
                  Fueling Duration (hrs)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={settings.fuel_duration_hours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fuel_duration_hours: parseFloat(e.target.value) || 0.5,
                    })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[6px]"
                />
              </div>
            </div>
          </div>

          {/* Carrier Metadata for RODS */}
          <div className="pt-3 border-t border-[#EAECF0]">
            <div className="text-[11px] font-semibold text-[#7A8490] tracking-wider uppercase mb-2.5">
              Carrier &amp; Equipment Details (for ELD / RODS Sheets)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-[#59636E] mb-1">
                  Carrier Name
                </label>
                <input
                  type="text"
                  value={carrierInfo.carrier_name}
                  onChange={(e) =>
                    setCarrierInfo({ ...carrierInfo, carrier_name: e.target.value })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#59636E] mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={carrierInfo.driver_name}
                  onChange={(e) =>
                    setCarrierInfo({ ...carrierInfo, driver_name: e.target.value })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#59636E] mb-1">
                  Tractor / Unit #
                </label>
                <input
                  type="text"
                  value={carrierInfo.vehicle_number}
                  onChange={(e) =>
                    setCarrierInfo({ ...carrierInfo, vehicle_number: e.target.value })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#59636E] mb-1">
                  Shipping Doc / BOL #
                </label>
                <input
                  type="text"
                  value={carrierInfo.shipping_doc}
                  onChange={(e) =>
                    setCarrierInfo({ ...carrierInfo, shipping_doc: e.target.value })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] text-[#171A1F] bg-white border border-[#D9DDE3] rounded-[6px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
