import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  LayoutDashboard,
  Smartphone,
  Layers,
  Calendar,
  GitCompare,
  ShieldAlert,
  GitPullRequest,
  History,
  FileBarChart,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    role,
    alerts,
    cves,
    releases,
    filters,
    updateFilter,
  } = usePlatform();
  const [collapsed, setCollapsed] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const criticalCVEs = cves.filter((c) => c.severity === 'CRITICAL' && c.workflowStatus !== 'closed').length;
  const atRiskReleases = releases.filter((r) => r.status === 'at_risk' || r.status === 'delayed').length;

  const navItems = [
    {
      id: 'executive',
      label: 'Executive Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['all'],
      badge: null,
    },
    {
      id: 'products',
      label: 'Products & Devices',
      icon: <Smartphone className="w-4 h-4" />,
      allowedRoles: ['all'],
      badge: null,
    },
    {
      id: 'platforms',
      label: 'Platforms',
      icon: <Layers className="w-4 h-4" />,
      allowedRoles: ['all'],
      badge: '5 Platforms',
    },
    {
      id: 'calendar',
      label: 'Release Calendar',
      icon: <Calendar className="w-4 h-4" />,
      allowedRoles: ['all'],
      badge: atRiskReleases > 0 ? `${atRiskReleases} At Risk` : null,
      badgeColor: 'text-amber-400 bg-amber-950/80 border-amber-800',
    },
    {
      id: 'comparison',
      label: 'Release Comparison',
      icon: <GitCompare className="w-4 h-4" />,
      allowedRoles: ['executive', 'senior_management', 'product_manager', 'engineering_lead', 'software_engineer', 'security_analyst', 'administrator'],
      badge: null,
    },
    {
      id: 'cve',
      label: 'CVE & Security Center',
      icon: <ShieldAlert className="w-4 h-4" />,
      allowedRoles: ['executive', 'senior_management', 'product_manager', 'engineering_lead', 'software_engineer', 'security_analyst', 'administrator'],
      badge: criticalCVEs > 0 ? `${criticalCVEs} Critical` : null,
      badgeColor: 'text-rose-400 bg-rose-950/80 border-rose-800',
    },
    {
      id: 'fixes',
      label: 'Fixes & Changes (Jira)',
      icon: <GitPullRequest className="w-4 h-4" />,
      allowedRoles: ['all'],
      badge: null,
    },
    {
      id: 'lifecycle',
      label: 'Product Lifecycle',
      icon: <History className="w-4 h-4" />,
      allowedRoles: ['all'],
      badge: null,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: <FileBarChart className="w-4 h-4" />,
      allowedRoles: ['all'],
      badge: null,
    },
    {
      id: 'alerts',
      label: 'Alerts & Notifications',
      icon: <Bell className="w-4 h-4" />,
      allowedRoles: ['all'],
      badge: unreadAlerts > 0 ? `${unreadAlerts} New` : null,
      badgeColor: 'text-rose-400 bg-rose-950/80 border-rose-800',
    },
    {
      id: 'admin',
      label: 'Administration & Sync',
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['administrator', 'engineering_lead', 'security_analyst'],
      badge: null,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-950 border-r border-slate-800/90 transition-all duration-200 select-none z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3.5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Stylized Zebra Brand Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800 flex items-center justify-center font-black text-white text-base shadow-md shadow-cyan-950/50 shrink-0">
            Z
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                ZEBRA
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ZRIP
                </span>
              </span>
              <span className="text-[10px] text-slate-400 truncate">Release Intelligence Platform</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isAllowed =
            item.allowedRoles.includes('all') || item.allowedRoles.includes(role);
          const isActive = activeTab === item.id;

          if (!isAllowed) {
            if (collapsed) return null;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-2.5 py-2 rounded text-slate-600 text-xs cursor-not-allowed group"
                title={`Restricted to authorized roles. Current role: ${role}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-600">{item.icon}</span>
                  <span className="line-through">{item.label}</span>
                </div>
                <Lock className="w-3 h-3 text-slate-600" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className={`${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    item.badgeColor || 'text-slate-400 bg-slate-900 border-slate-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Platform Switcher in Sidebar (When expanded) */}
        {!collapsed && (
          <div className="mt-5 pt-3 border-t border-slate-800/80 px-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              <span>Platforms</span>
              <span className="text-[10px] font-mono text-cyan-400">1 - 5</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {([1, 2, 3, 4, 5] as const).map((num) => {
                const platId = `platform-${num}`;
                const isSelected = filters.platformIds.includes(platId);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        updateFilter(
                          'platformIds',
                          filters.platformIds.filter((p) => p !== platId)
                        );
                      } else {
                        updateFilter('platformIds', [...filters.platformIds, platId]);
                      }
                    }}
                    className={`h-7 rounded text-xs font-bold font-mono transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm shadow-cyan-950'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    title={`Toggle filter for Platform ${num}`}
                  >
                    P{num}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Official Documentation Links Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 bg-slate-950/70">
          <p className="font-semibold text-slate-400 mb-1">Authoritative Portals</p>
          <div className="space-y-1">
            <a
              href="https://techdocs.zebra.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <span>techdocs.zebra.com</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://www.cve.org"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <span>cve.org / NVD</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}
    </aside>
  );
};
