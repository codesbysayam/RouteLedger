import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './Sidebar.tsx';
import { Menu, X, Printer, RefreshCw } from 'lucide-react';

interface AppShellProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  dayCount?: number;
  hasTrip?: boolean;
  tripRouteTitle?: string;
  onLoadExample?: () => void;
  onPrint?: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  dayCount = 0,
  hasTrip = false,
  tripRouteTitle,
  onLoadExample,
  onPrint,
  isLoading = false,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZoneName: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabBreadcrumbs: Record<ActiveTab, { section: string; title: string }> = {
    planner: { section: 'Workspace', title: 'Trip Planner' },
    logs: { section: 'Workspace', title: 'Daily Logs' },
    turnbyturn: { section: 'Workspace', title: 'Route Instructions' },
    history: { section: 'Workspace', title: 'Trip History' },
    rules: { section: 'Compliance', title: 'HOS Rules' },
    fleet: { section: 'Compliance', title: 'Fleet & Vehicle' },
    settings: { section: 'System', title: 'Settings' },
  };

  const currentCrumb = tabBreadcrumbs[activeTab];

  return (
    <div className="flex min-h-screen w-full bg-[#EEF3F8] text-[#172033] relative">
      {/* Desktop Sidebar (pinned to viewport height) */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0 z-20">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          dayCount={dayCount}
          hasTrip={hasTrip}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-[#FFFFFF] border-r border-[#D9E2EC] transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-3 border-b border-[#D9E2EC]">
          <span className="text-xs font-semibold text-[#172033]">RouteLedger</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded text-[#7A8798] hover:text-[#172033]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            onSelectTab(tab);
            setMobileMenuOpen(false);
          }}
          dayCount={dayCount}
          hasTrip={hasTrip}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header (sticky on scroll) */}
        <div className="sticky top-0 z-30 shrink-0 print:hidden bg-white/95 backdrop-blur-md">
          <div className="h-[2.5px] w-full bg-[#2563EB] shrink-0" />
          <header
            id="app-top-header"
            className="h-[52px] bg-white/95 backdrop-blur-md border-b border-[#D9E2EC] flex items-center justify-between px-4 sm:px-7 select-none shadow-xs"
          >
            {/* LEFT: Breadcrumbs */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 -ml-1.5 text-[#526174] hover:text-[#172033] md:hidden rounded cursor-pointer"
                aria-label="Open Navigation"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 text-[13px] min-w-0">
                <span className="text-[#7A8798] font-medium text-[12px] uppercase tracking-wider">
                  {currentCrumb.section}
                </span>
                <span className="text-[#CBD5E1]">/</span>
                <span className="font-semibold text-[#172033]">
                  {currentCrumb.title}
                </span>

                {tripRouteTitle && (
                  <>
                    <span className="text-[#CBD5E1] hidden sm:inline">/</span>
                    <span className="text-[#2563EB] font-mono text-[12px] font-semibold hidden sm:inline truncate max-w-[240px] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFD5FF]">
                      {tripRouteTitle}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Operational Status & Current Time */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              {onLoadExample && (
                <button
                  type="button"
                  onClick={onLoadExample}
                  disabled={isLoading}
                  className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-lg hover:bg-[#F8FAFC] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#2563EB] ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Demo</span>
                </button>
              )}

              {onPrint && hasTrip && (
                <button
                  type="button"
                  onClick={onPrint}
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-[#172033] bg-[#FFFFFF] border border-[#D9E2EC] rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#526174]" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              )}

              {/* Status Pill Badge (Unified Standard) */}
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>Operational</span>
              </div>

              <div className="font-mono text-xs text-[#526174] hidden lg:block border-l border-[#D9E2EC] pl-3">
                {currentTime}
              </div>
            </div>
          </header>
        </div>

        {/* Main Workspace Canvas with light commercial logistics background & subtle grid */}
        <main id="app-workspace-container" className="flex-1 w-full rl-workspace bg-technical-canvas">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-7 py-5 md:py-6 pb-24">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

