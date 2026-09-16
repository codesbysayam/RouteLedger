import React, { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell.tsx';
import { ActiveTab } from './components/Sidebar.tsx';
import { PageHeader } from './components/PageHeader.tsx';
import { MetricStrip } from './components/MetricStrip.tsx';
import { TripForm } from './components/TripForm.tsx';
import { RouteMap } from './components/RouteMap.tsx';
import { ComplianceSummary } from './components/ComplianceSummary.tsx';
import { StopTimeline } from './components/StopTimeline.tsx';
import { DailyLogViewer } from './components/DailyLogViewer.tsx';
import { RouteInstructions } from './components/RouteInstructions.tsx';
import { TripHistoryView } from './components/TripHistoryView.tsx';
import { HOSRulesView } from './components/HOSRulesModal.tsx';
import { FleetSpecsView } from './components/FleetSpecsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { PrintView } from './components/PrintView.tsx';
import { TripPlan, CarrierInfo, PlanningSettings } from './types.ts';
import { planTrip } from './services/api.ts';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('planner');
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [tripHistory, setTripHistory] = useState<TripPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load default commercial route (Richmond, VA -> Newark, NJ) on initial mount
  useEffect(() => {
    executePlan({
      origin: 'Richmond, VA',
      pickup: 'Richmond, VA',
      destination: 'Newark, NJ',
      current_cycle_used: 0.0,
      departure_time: '06:00',
      carrier_info: {
        carrier_name: 'Apex Freight Systems LLC',
        main_office: '4200 Logistics Blvd, Richmond, VA 23230',
        home_terminal: 'Richmond Terminal, VA',
        driver_name: 'John R. Miller',
        vehicle_number: 'TRK-4089',
        trailer_number: 'TLR-8821',
        shipping_doc: 'BOL-77341 / Auto Parts & Freight',
        co_driver: 'Solo Driver',
      },
      settings: {
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
      },
    });
  }, []);

  const executePlan = async (payload: {
    origin: string;
    pickup: string;
    destination: string;
    current_cycle_used: number;
    departure_time: string;
    carrier_info: CarrierInfo;
    settings: PlanningSettings;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await planTrip({
        origin: payload.origin,
        pickup: payload.pickup,
        destination: payload.destination,
        current_cycle_used: payload.current_cycle_used,
        departure_time: payload.departure_time,
        carrier_info: payload.carrier_info,
        settings: payload.settings,
      });

      setTripPlan(plan);
      setTripHistory((prev) => {
        const filtered = prev.filter((p) => p.id !== plan.id);
        return [plan, ...filtered];
      });
    } catch (err: any) {
      console.error('Commercial trip calculation failed:', err);
      setError(err?.message || 'Failed to calculate commercial route and HOS schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    await executePlan({
      origin: 'Richmond, VA',
      pickup: 'Richmond, VA',
      destination: 'Newark, NJ',
      current_cycle_used: 0.0,
      departure_time: '06:00',
      carrier_info: {
        carrier_name: 'Apex Freight Systems LLC',
        main_office: '4200 Logistics Blvd, Richmond, VA 23230',
        home_terminal: 'Richmond Terminal, VA',
        driver_name: 'John R. Miller',
        vehicle_number: 'TRK-4089',
        trailer_number: 'TLR-8821',
        shipping_doc: 'BOL-77341 / Auto Parts & Freight',
        co_driver: 'Solo Driver',
      },
      settings: {
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
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const originCity = tripPlan?.origin?.city || tripPlan?.origin?.display_name?.split(',')[0] || 'Richmond, VA';
  const destCity = tripPlan?.destination?.city || tripPlan?.destination?.display_name?.split(',')[0] || 'Newark, NJ';
  const routeRouteText = `${originCity} → ${destCity}`;

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      dayCount={tripPlan?.daily_logs?.length || tripPlan?.days_count || 0}
      hasTrip={!!tripPlan}
    >
      {/* Error Banner */}
      {error && (
        <div className="mb-4 bg-[#3B151E] border border-[#5C232E] text-[#FFB4BC] p-3 rounded-[8px] flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#FF5C6C]" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="font-semibold text-[#FF5C6C] hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW: TRIP PLANNER */}
      {activeTab === 'planner' && (
        <div className="space-y-4">
          <PageHeader
            title="Trip Planner"
            routeHeading={routeRouteText}
            statusText={tripPlan ? 'Route planned · FMCSA compliant' : 'Ready to plan'}
            onLoadExample={handleLoadDemo}
            onPrint={handlePrint}
            isLoading={isLoading}
          />

          {/* Form Controls */}
          <TripForm
            onPlanTrip={executePlan}
            isLoading={isLoading}
            onLoadExample={handleLoadDemo}
            currentOrigin={tripPlan?.origin?.display_name || 'Richmond, VA'}
            currentDestination={tripPlan?.destination?.display_name || 'Newark, NJ'}
          />

          {/* Metric Strip */}
          {tripPlan && <MetricStrip trip={tripPlan} />}

          {/* Map is the Dominant Visual Center */}
          <div className="h-[520px] lg:h-[560px]">
            <RouteMap
              geometry={tripPlan?.route_geometry || []}
              stops={tripPlan?.stops || []}
              totalMiles={tripPlan?.total_distance_miles}
              totalDriveHours={tripPlan?.total_drive_hours}
              originName={tripPlan?.origin?.display_name || 'Richmond, VA'}
              destinationName={tripPlan?.destination?.display_name || 'Newark, NJ'}
            />
          </div>

          {/* 2-Column Operational Audit Below Map: Stop Timeline & HOS Compliance Table */}
          {tripPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-5">
                <StopTimeline
                  events={tripPlan.events}
                  stops={tripPlan.stops}
                />
              </div>

              <div className="lg:col-span-7">
                <ComplianceSummary
                  validation={tripPlan.validation}
                  initialCycleUsed={tripPlan.initial_cycle_used}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: DAILY LOGS (RODS) */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <DailyLogViewer
            logs={tripPlan?.daily_logs || []}
            originName={originCity}
            destinationName={destCity}
          />
        </div>
      )}

      {/* VIEW: TURN-BY-TURN INSTRUCTIONS */}
      {activeTab === 'turnbyturn' && (
        <div className="space-y-4">
          <RouteInstructions
            steps={tripPlan?.route_steps || []}
            originName={tripPlan?.origin?.display_name || originCity}
            destName={tripPlan?.destination?.display_name || destCity}
            totalMiles={tripPlan?.total_distance_miles}
            totalDriveHours={tripPlan?.total_drive_hours}
          />
        </div>
      )}

      {/* VIEW: TRIP HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <TripHistoryView
            trips={tripHistory}
            onSelectTrip={(trip) => {
              setTripPlan(trip);
              setActiveTab('planner');
            }}
          />
        </div>
      )}

      {/* VIEW: HOS RULEBOOK */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <HOSRulesView />
        </div>
      )}

      {/* VIEW: FLEET SPECS */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <FleetSpecsView />
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <SettingsView />
        </div>
      )}

      {/* Dedicated Print Sheet: Activates during window.print() */}
      {tripPlan && (
        <div className="hidden print:block">
          <PrintView plan={tripPlan} />
        </div>
      )}
    </AppShell>
  );
}
