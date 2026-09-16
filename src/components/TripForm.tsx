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
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 420);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

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
  const cyclePercent = (cycleVal / 70) * 100;
  const cycleColor =
    cyclePercent > 85
      ? '#DC2626'
      : cyclePercent > 60
      ? '#F59E0B'
      : '#0F9D8A';

  return (
    <form
      id="trip-planner-form"
      onSubmit={handleSubmit}
      className="bg-[#FFFFFF] border border-[#D9E2EC] rounded-[10px] overflow-hidden select-none shadow-[0_4px_14px_rgba(15,23,42,0.06)]"
    >
      {/* 3px Top Accent Line: #2563EB Solid */}
      <div className="h-[3px] w-full bg-[#2563EB] shrink-0" />

      {/* Form Section Header: Light Surface with border #D9E2EC */}
      <div className="bg-[#F8FAFC] px-5 sm:px-6 pt-3.5 pb-3 border-b border-[#D9E2EC]">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[11px] font-bold text-[#2563EB] tracking-[0.08em] uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span>TRIP PARAMETERS</span>
          </div>
          <span className="text-[11px] font-mono font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#BFD5FF]">
            FMCSA 70h / 8d Rule
          </span>
        </div>
        <p className="text-[12.5px] text-[#526174]">
          Commercial Route &amp; HOS Configuration
        </p>
      </div>

      <div className="p-5 sm:p-6 pt-5 bg-[#FFFFFF]">
        {/* 3-Step Connected Journey Progression */}
        <div className="relative mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 relative z-10">
            {/* 1. Origin (Cyan #0891B2) Node */}
            <div className="relative bg-[#FFFFFF] border border-[#D9E2EC] border-l-4 border-l-[#0891B2] rounded-[8px] p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center shrink-0 border border-[#A5F3FC]">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-[12px] font-bold text-[#0891B2]">
                    Origin Location
                  </label>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#0891B2] bg-[#ECFEFF] px-1.5 py-0.5 rounded border border-[#A5F3FC]">
                  STEP 01
                </span>
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
                  className="w-full h-[38px] px-3 text-[13px] text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] hover:border-[#0891B2]/60 focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all placeholder:text-[#94A3B8]"
                />
                {origin && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrigin('');
                      setOriginSuggestions([]);
                    }}
                    className="absolute right-2.5 text-[#7A8798] hover:text-[#172033] p-1 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {activeInput === 'origin' && originSuggestions.length > 0 && (
                <div className="absolute top-[82px] left-0 right-0 z-30 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[7px] shadow-xl py-1 overflow-hidden">
                  {originSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => {
                        setOrigin(item.display_name);
                        if (pickup === origin) setPickup(item.display_name);
                        setOriginSuggestions([]);
                      }}
                      className="w-full text-left px-3.5 py-2 text-[12px] text-[#172033] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors truncate block cursor-pointer"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Cargo Pickup (Blue #2563EB) Node */}
            <div className="relative bg-[#FFFFFF] border border-[#D9E2EC] border-l-4 border-l-[#2563EB] rounded-[8px] p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#BFD5FF]">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-[12px] font-bold text-[#2563EB]">
                    Cargo Pickup
                  </label>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFD5FF]">
                  STEP 02
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Richmond Distribution Center"
                  className="w-full h-[38px] px-3 text-[13px] text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] hover:border-[#2563EB]/60 focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all placeholder:text-[#94A3B8]"
                />
                {pickup && (
                  <button
                    type="button"
                    onClick={() => setPickup('')}
                    className="absolute right-2.5 text-[#7A8798] hover:text-[#172033] p-1 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. Destination (Indigo #6366F1) Node */}
            <div className="relative bg-[#FFFFFF] border border-[#D9E2EC] border-l-4 border-l-[#6366F1] rounded-[8px] p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#F3F1FF] text-[#6366F1] flex items-center justify-center shrink-0 border border-[#DDD6FE]">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <label className="text-[12px] font-bold text-[#6366F1]">
                    Destination
                  </label>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#6366F1] bg-[#F3F1FF] px-1.5 py-0.5 rounded border border-[#DDD6FE]">
                  STEP 03
                </span>
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
                  className="w-full h-[38px] px-3 text-[13px] text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] hover:border-[#6366F1]/60 focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all placeholder:text-[#94A3B8]"
                />
                {destination && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestination('');
                      setDestSuggestions([]);
                    }}
                    className="absolute right-2.5 text-[#7A8798] hover:text-[#172033] p-1 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {activeInput === 'dest' && destSuggestions.length > 0 && (
                <div className="absolute top-[82px] left-0 right-0 z-30 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[7px] shadow-xl py-1 overflow-hidden">
                  {destSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={() => {
                        setDestination(item.display_name);
                        setDestSuggestions([]);
                      }}
                      className="w-full text-left px-3.5 py-2 text-[12px] text-[#172033] hover:bg-[#F3F1FF] hover:text-[#6366F1] transition-colors truncate block cursor-pointer"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Operational Parameters (Departure + Cycle) & Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5 items-end mb-1">
          {/* Departure Time (3 cols) */}
          <div className="md:col-span-3">
            <label className="block text-[12px] font-bold text-[#526174] mb-1">
              Departure Time
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full h-[40px] px-3.5 text-[13px] font-mono text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[7px] hover:border-[#2563EB]/60 focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
            />
          </div>

          {/* Current Cycle Used: 5 cols */}
          <div className="md:col-span-4 bg-[#F8FAFC] border border-[#D9E2EC] border-l-4 border-l-[#16A34A] rounded-[8px] p-2.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider">
                CURRENT CYCLE
              </label>
              <span className="font-mono text-[11px] text-[#526174]">
                <span className="font-semibold text-[#172033]">{cycleVal.toFixed(1)}h</span> used ·{' '}
                <span className="font-bold text-[#16A34A]">{cycleRemaining.toFixed(1)}h left</span>
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
                  className="w-full h-[32px] px-3 text-[13px] font-mono text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] hover:border-[#16A34A]/60 focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                />
                <span className="absolute right-3 text-[11px] font-mono text-[#7A8798] pointer-events-none">
                  / 70.0h max
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-[4px] bg-[#E2E8F0] rounded-full overflow-hidden mt-1.5 border border-[#CBD5E1]">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, cyclePercent)}%`,
                    backgroundColor: cycleColor,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Advanced Disclosure Toggle */}
          <div className="md:col-span-2 flex items-center h-[40px]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center justify-center gap-1.5 w-full h-full text-[12px] font-semibold text-[#526174] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[7px] px-3 hover:bg-[#F8FAFC] hover:text-[#172033] cursor-pointer transition-colors shadow-xs"
            >
              <span>Parameters</span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#526174]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#526174]" />
              )}
            </button>
          </div>

          {/* Operational Action Buttons: Demo + Generate Route & Logs */}
          <div className="md:col-span-3 flex items-center gap-2 h-[40px]">
            {onLoadExample && (
              <button
                type="button"
                onClick={onLoadExample}
                disabled={isLoading}
                className="h-full px-3 text-[12px] font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFD5FF] rounded-[8px] hover:bg-[#DBEAFE] transition-colors cursor-pointer shrink-0"
              >
                Demo
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !origin.trim() || !destination.trim()}
              className="flex-1 h-full px-4 text-[12.5px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[8px] shadow-[0_4px_12px_rgba(37,99,235,0.20)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Planning...</span>
                </>
              ) : (
                <>
                  <Route className="w-4 h-4" />
                  <span className="tracking-wide">GENERATE ROUTE &amp; LOGS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Technical Loading Console */}
        {isLoading && (
          <div className="mt-4 p-3.5 bg-[#F8FAFC] border border-[#D9E2EC] rounded-[8px] text-[12px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#16A34A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                ROUTE ENGINE DISPATCHING
              </span>
              <span className="text-[10px] font-mono text-[#7A8798]">STEP {loadingStep + 1} OF 5</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
              {[
                'Geocoding locations',
                'Road geometry',
                'HOS limits audit',
                'Scheduling stops',
                'Building daily logs',
              ].map((stepText, idx) => {
                const isDone = loadingStep > idx;
                const isCurrent = loadingStep === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded border transition-colors ${
                      isDone
                        ? 'bg-[#ECFDF3] border-[#B7E4C7] text-[#15803D]'
                        : isCurrent
                        ? 'bg-[#EFF6FF] border-[#BFD5FF] text-[#2563EB] font-bold'
                        : 'bg-white border-[#E2E8F0] text-[#7A8798]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDone ? 'bg-[#16A34A]' : isCurrent ? 'bg-[#2563EB] animate-pulse' : 'bg-[#CBD5E1]'
                      }`}
                    />
                    <span className="truncate">{stepText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Advanced Options Disclosure */}
      {showAdvanced && (
        <div className="border-t border-[#D9E2EC] bg-[#F8FAFC] p-5 sm:p-6 space-y-4">
          {/* Dispatch Constraints */}
          <div>
            <div className="text-[10.5px] font-bold text-[#6366F1] tracking-[0.08em] uppercase mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              <span>Operating Durations &amp; Intervals</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#526174] mb-1">
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
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#526174] mb-1">
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
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#526174] mb-1">
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
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#526174] mb-1">
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
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Carrier Metadata for RODS */}
          <div className="pt-3 border-t border-[#D9E2EC]">
            <div className="text-[10.5px] font-bold text-[#0891B2] tracking-[0.08em] uppercase mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
              <span>Carrier &amp; Equipment Details (for ELD / RODS Sheets)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#526174] mb-1">
                  Carrier Name
                </label>
                <input
                  type="text"
                  value={carrierInfo.carrier_name}
                  onChange={(e) =>
                    setCarrierInfo({ ...carrierInfo, carrier_name: e.target.value })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#526174] mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={carrierInfo.driver_name}
                  onChange={(e) =>
                    setCarrierInfo({ ...carrierInfo, driver_name: e.target.value })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#526174] mb-1">
                  Tractor / Unit #
                </label>
                <input
                  type="text"
                  value={carrierInfo.vehicle_number}
                  onChange={(e) =>
                    setCarrierInfo({ ...carrierInfo, vehicle_number: e.target.value })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] font-mono text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#526174] mb-1">
                  Shipping Doc / BOL #
                </label>
                <input
                  type="text"
                  value={carrierInfo.shipping_doc}
                  onChange={(e) =>
                    setCarrierInfo({ ...carrierInfo, shipping_doc: e.target.value })
                  }
                  className="w-full h-[36px] px-2.5 text-[12px] text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-[6px] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
