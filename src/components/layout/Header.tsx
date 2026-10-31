import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { UserRole } from '../../types';
import {
  Search,
  RefreshCw,
  Bell,
  Shield,
  Sliders,
  AlertOctagon,
  Sparkles,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    isDemoMode,
    setIsDemoMode,
    lastSyncTimestamp,
    triggerDataSync,
    isSyncing,
    setIsGlobalSearchOpen,
    alerts,
    setActiveTab,
  } = usePlatform();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  const roleLabels: Record<UserRole, { title: string; badge: string; desc: string }> = {
    executive: {
      title: 'Senior VP / Vice President',
      badge: 'Executive',
      desc: 'High-level business impact, delivery risks, cross-platform health & escalations',
    },
    senior_management: {
      title: 'Senior Management',
      badge: 'Director',
      desc: 'Release predictability, SLA compliance, security exposure overviews',
    },
    product_manager: {
      title: 'Product Manager',
      badge: 'Product',
      desc: 'Assigned platform roadmap, scope, device compatibility, customer release notes',
    },
    engineering_lead: {
      title: 'Engineering / Tech Lead',
      badge: 'Eng Lead',
      desc: 'Jira issues, blockers, carry-overs, BSP trees, regressions, release comparisons',
    },
    software_engineer: {
      title: 'Software & QA Engineer',
      badge: 'QA / Eng',
      desc: 'Defects, CVE patches, commit reviews, CTS test suites, verification runs',
    },
    security_analyst: {
      title: 'Product Security / Vulnerability Mgr',
      badge: 'AppSec',
      desc: 'CVE investigations, CVSS scores, CISA KEV, exploit notes, SLA remediation workflows',
    },
    sales: {
      title: 'Sales & Customer Enablement',
      badge: 'Sales',
      desc: 'Restricted business view: Released GA versions, customer notes, verified hardware',
    },
    general_employee: {
      title: 'General Employee',
      badge: 'Employee',
      desc: 'General announcements, verified device mappings, public release summaries',
    },
    administrator: {
      title: 'Dashboard Administrator',
      badge: 'Admin',
      desc: 'Jira/CVE API integrations, data sync triggers, device verification approvals',
    },
  };

  const formatLastSync = (date: Date) => {
    const diffMins = Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60)));
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Global Search trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Search products, devices (e.g. 4490, 33605), CVEs, Jira keys...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Center: Demo Data Warning Banner / Status Indicator */}
        <div className="hidden lg:flex items-center gap-2">
          {isDemoMode ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-600/70 text-amber-300 text-xs font-medium">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>DEMO DATA — NOT CONNECTED TO LIVE ZEBRA SYSTEMS</span>
              <button
                type="button"
                onClick={() => setIsDemoMode(false)}
                className="ml-1 text-[11px] underline hover:text-amber-100 font-semibold cursor-pointer"
                title="Switch to Connected Enterprise Mode"
              >
                Switch to Live
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 text-xs font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>CONNECTED ENTERPRISE ENGINE (JIRA & CVE.ORG ACTIVE)</span>
              <button
                type="button"
                onClick={() => setIsDemoMode(true)}
                className="ml-1 text-[11px] underline hover:text-emerald-100 font-semibold cursor-pointer"
                title="Switch to Demonstration Sandbox"
              >
                Demo Mode
              </button>
            </div>
          )}
        </div>

        {/* Right side controls: Sync, Notifications, Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Data Freshness & Sync */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px]">Synced {formatLastSync(lastSyncTimestamp)}</span>
            <button
              type="button"
              onClick={() => triggerDataSync()}
              disabled={isSyncing}
              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-50 cursor-pointer"
              title="Trigger delta synchronization against Jira and CVE feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Alert Notification Bell */}
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-slate-700 transition-colors cursor-pointer"
            title="Open Alerts Center"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold font-mono rounded-full bg-rose-600 text-white animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-left hidden sm:block">
                <span className="text-slate-400 text-[10px] block leading-none">Role:</span>
                <span className="font-semibold text-slate-200 text-xs leading-tight">
                  {roleLabels[role].badge}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-800 text-slate-400 text-[11px] font-medium flex items-center justify-between">
                  <span>Role-Based Access Simulation</span>
                  <Sliders className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {(Object.keys(roleLabels) as UserRole[]).map((rKey) => {
                    const rInfo = roleLabels[rKey];
                    const isSelected = role === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => {
                          setRole(rKey);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-cyan-950/50 text-cyan-200 border-l-2 border-cyan-400'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{rInfo.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {rInfo.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{rInfo.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
