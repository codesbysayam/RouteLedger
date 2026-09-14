import React from 'react';
import {
  Route,
  FileText,
  Navigation,
  History,
  ShieldCheck,
  Truck,
  Settings,
} from 'lucide-react';

export type ActiveTab = 'planner' | 'logs' | 'turnbyturn' | 'history' | 'rules' | 'fleet' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  dayCount?: number;
  hasTrip?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  dayCount = 0,
  hasTrip = false,
}) => {
  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        {
          id: 'planner' as ActiveTab,
          label: 'Trip Planner',
          icon: <Route className="w-4 h-4 stroke-[1.8]" />,
          badge: null,
        },
        {
          id: 'logs' as ActiveTab,
          label: 'Daily Logs',
          icon: <FileText className="w-4 h-4 stroke-[1.8]" />,
          badge: hasTrip ? `${dayCount}d` : null,
        },
        {
          id: 'turnbyturn' as ActiveTab,
          label: 'Route Instructions',
          icon: <Navigation className="w-4 h-4 stroke-[1.8]" />,
          badge: null,
        },
        {
          id: 'history' as ActiveTab,
          label: 'Trip History',
          icon: <History className="w-4 h-4 stroke-[1.8]" />,
          badge: null,
        },
      ],
    },
    {
      title: 'COMPLIANCE',
      items: [
        {
          id: 'rules' as ActiveTab,
          label: 'HOS Rules',
          icon: <ShieldCheck className="w-4 h-4 stroke-[1.8]" />,
          badge: '§ 395',
        },
        {
          id: 'fleet' as ActiveTab,
          label: 'Fleet & Vehicle',
          icon: <Truck className="w-4 h-4 stroke-[1.8]" />,
          badge: null,
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'settings' as ActiveTab,
          label: 'Settings',
          icon: <Settings className="w-4 h-4 stroke-[1.8]" />,
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside
      id="routeledger-sidebar"
      className="w-[232px] bg-[#FBFCFD] border-r border-[#E5E7EB] flex flex-col shrink-0 select-none print:hidden h-full"
    >
      {/* App Header / Brand */}
      <div className="h-[56px] px-4 border-b border-[#E5E7EB] flex items-center gap-2.5">
        {/* Custom 32x32 RL Monogram with dark navy base & subtle teal accent */}
        <div className="relative w-8 h-8 rounded-[8px] bg-[#0F172A] text-white flex items-center justify-center font-mono font-bold text-[13px] tracking-tight shrink-0 shadow-xs">
          <span className="text-white">R</span>
          <span className="text-[#0F9D8A]">L</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#0F9D8A] ring-2 ring-[#FBFCFD]" />
        </div>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-[#111827] leading-tight tracking-tight truncate">
            RouteLedger
          </div>
          <div className="text-[11px] text-[#5B6470] leading-tight tracking-normal truncate">
            Commercial Dispatch
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-3 px-2 space-y-5 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-2.5 mb-1 text-[10px] font-semibold text-[#7A8490] tracking-wider uppercase">
              {section.title}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`relative w-full flex items-center justify-between px-2.5 py-1.5 text-[13px] rounded-[6px] transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#E8F7F4] text-[#087F70] font-semibold pl-3'
                        : 'text-[#5B6470] hover:text-[#111827] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {/* Active small teal vertical indicator on LEFT */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0F9D8A] rounded-r" />
                    )}

                    <div className="flex items-center gap-2">
                      <span className={isActive ? 'text-[#0F9D8A]' : 'text-[#667085]'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-[#BCE7DF] text-[#087F70] font-medium'
                            : 'bg-[#E5E7EB] text-[#5B6470]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#E5E7EB] bg-[#FBFCFD] text-[11px] text-[#5B6470] space-y-1.5">
        <div className="flex items-center justify-between">
          <span>Routing Engine</span>
          <span className="font-mono text-[#111827] text-[10px]">OSRM + OSM</span>
        </div>
        <div className="flex items-center justify-between">
          <span>System Status</span>
          <span className="inline-flex items-center gap-1.5 text-[#0F9D8A] font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A]"></span>
            Operational
          </span>
        </div>
        <div className="text-[10px] text-[#A4ACB5] pt-1 border-t border-[#E5E7EB]">
          FMCSA 49 CFR Part 395
        </div>
      </div>
    </aside>
  );
};

