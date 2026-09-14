import React from 'react';
import { Truck, ShieldCheck, Printer, RotateCcw, FileText, Compass } from 'lucide-react';

interface NavbarProps {
  onPrint: () => void;
  onLoadExample: () => void;
  activeView: 'planner' | 'logs' | 'turnByTurn';
  setActiveView: (view: 'planner' | 'logs' | 'turnByTurn') => void;
  hasPlan: boolean;
  isCompliant: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onPrint,
  onLoadExample,
  activeView,
  setActiveView,
  hasPlan,
  isCompliant,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">RouteLedger</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  HOS & ELD Compliance
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Commercial Driver Route Planner • FMCSA 49 CFR Part 395
              </p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          {hasPlan && (
            <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs font-medium">
              <button
                id="nav-btn-planner"
                onClick={() => setActiveView('planner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeView === 'planner'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Route & Schedule
              </button>
              <button
                id="nav-btn-logs"
                onClick={() => setActiveView('logs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeView === 'logs'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                ELD / RODS Daily Logs
              </button>
              <button
                id="nav-btn-steps"
                onClick={() => setActiveView('turnByTurn')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeView === 'turnByTurn'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Turn-by-Turn
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasPlan && (
              <div
                className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isCompliant
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                    : 'bg-red-950/80 text-red-300 border-red-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isCompliant ? 'FMCSA Compliant' : 'Audit Violations'}
              </div>
            )}

            <button
              id="load-demo-btn"
              onClick={onLoadExample}
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 transition"
              title="Load standard commercial trip: Richmond, VA to Newark, NJ (340 mi)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Load Example Trip</span>
              <span className="sm:hidden">Example</span>
            </button>

            {hasPlan && (
              <button
                id="print-btn"
                onClick={onPrint}
                className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg shadow-sm transition"
                title="Print or export FMCSA driver logs & trip itinerary"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export / Print Logs</span>
                <span className="sm:hidden">Print</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
