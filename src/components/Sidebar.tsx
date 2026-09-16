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
      className="w-[232px] bg-[#F8FAFC] border-r border-[#D9E2EC] flex flex-col shrink-0 select-none print:hidden h-full relative"
    >
      {/* Brand Top Accent Line */}
      <div className="h-[2.5px] w-full bg-[#2563EB] shrink-0" />

      {/* App Header / Brand */}
      <div className="h-[54px] px-4 border-b border-[#D9E2EC] flex items-center gap-2.5 bg-[#FFFFFF]">
        {/* Clean RL Monogram with blue accent */}
        <div className="relative w-8 h-8 rounded-[7px] bg-[#EFF6FF] border border-[#BFD5FF] text-[#2563EB] flex items-center justify-center font-mono font-bold text-[13px] tracking-tight shrink-0 shadow-xs">
          <span className="text-[#2563EB]">R</span>
          <span className="text-[#0891B2]">L</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#16A34A] ring-2 ring-[#FFFFFF]" />
        </div>
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold text-[#172033] leading-tight tracking-tight truncate flex items-center gap-1.5">
            <span>RouteLedger</span>
          </div>
          <div className="text-[10.5px] text-[#7A8798] leading-tight tracking-normal truncate">
            Commercial Logistics Hub
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {navSections.map((section, sIdx) => {
          return (
            <div key={sIdx}>
              <div className="px-2.5 mb-1.5 text-[10px] font-bold text-[#7A8798] tracking-[0.08em] uppercase flex items-center gap-1.5">
                <span>{section.title}</span>
              </div>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`relative w-full flex items-center justify-between px-2.5 py-1.5 text-[13px] rounded-[6px] transition-all duration-150 cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#E8F1FF] text-[#1746A2] border border-[#BFD5FF] font-semibold pl-3 shadow-xs'
                          : 'text-[#526174] hover:text-[#172033] hover:bg-[#F0F6FF]'
                      }`}
                    >
                      {/* Active left accent line */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#2563EB] rounded-r" />
                      )}

                      <div className="flex items-center gap-2">
                        <span className={isActive ? 'text-[#2563EB]' : 'text-[#7A8798]'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-[#FFFFFF] text-[#2563EB] font-bold border border-[#BFD5FF]'
                              : 'bg-[#F1F5F9] text-[#7A8798] border border-[#E2E8F0]'
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
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#D9E2EC] bg-[#FFFFFF] text-[11px] text-[#526174] space-y-1.5">
        <div className="flex items-center justify-between">
          <span>Routing Engine</span>
          <span className="font-mono text-[#2563EB] font-medium text-[10.5px]">OSRM + OSM</span>
        </div>
        <div className="flex items-center justify-between">
          <span>System Status</span>
          <span className="inline-flex items-center gap-1.5 text-[#16A34A] font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            Active
          </span>
        </div>
        <div className="text-[10px] text-[#7A8798] pt-1.5 border-t border-[#E2E8F0] flex items-center justify-between">
          <span>FMCSA 49 CFR Part 395</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
        </div>
      </div>
    </aside>
  );
};

