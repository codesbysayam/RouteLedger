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
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F8FA] text-[#111827]">
      {/* Desktop Sidebar (232px, recedes, calm) */}
      <div className="hidden md:flex h-full shrink-0">
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
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-[#FBFCFD] transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-3 border-b border-[#E5E7EB]">
          <span className="text-xs font-semibold text-[#111827]">RouteLedger</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded text-[#5B6470] hover:text-[#111827]"
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Refined 56px Application Header */}
        <header
          id="app-top-header"
          className="h-[56px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-7 shrink-0 print:hidden select-none"
        >
          {/* LEFT: Breadcrumbs (Workspace / Trip Planner) */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 text-[#5B6470] hover:text-[#111827] md:hidden rounded cursor-pointer"
              aria-label="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-[13px] min-w-0">
              <span className="text-[#5B6470] font-normal">
                {currentCrumb.section}
              </span>
              <span className="text-[#A4ACB5]">/</span>
              <span className="font-semibold text-[#111827]">
                {currentCrumb.title}
              </span>

              {tripRouteTitle && (
                <>
                  <span className="text-[#A4ACB5] hidden sm:inline">/</span>
                  <span className="text-[#0F9D8A] font-mono text-[12px] font-medium hidden sm:inline truncate max-w-[240px]">
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
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#5B6470] bg-white border border-[#D9DDE3] rounded-[7px] hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Demo</span>
              </button>
            )}

            {onPrint && hasTrip && (
              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#111827] bg-white border border-[#D9DDE3] rounded-[7px] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              >
                <Printer className="w-3 h-3 text-[#5B6470]" />
                <span className="hidden sm:inline">Print</span>
              </button>
            )}

            {/* Tiny teal status dot for Operational */}
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#087F70] bg-[#E8F7F4] border border-[#BCE7DF] px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]"></span>
              <span>Operational</span>
            </div>

            <div className="font-mono text-[11px] text-[#5B6470] hidden lg:block border-l border-[#E5E7EB] pl-3">
              {currentTime}
            </div>
          </div>
        </header>

        {/* Main Workspace Canvas (Dominant Visual Center, tight padding) */}
        <main id="app-workspace-container" className="flex-1 overflow-y-auto bg-[#F7F8FA]">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-7 py-5 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

