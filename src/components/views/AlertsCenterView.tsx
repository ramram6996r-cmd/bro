import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Layers,
  Filter,
} from 'lucide-react';

export const AlertsCenterView: React.FC = () => {
  const {
    filteredAlerts,
    acknowledgeAlert,
    setSelectedCVE,
    setSelectedRelease,
    setSelectedDevice,
    setSelectedJiraIssue,
    cves,
    releases,
    devices,
    jiraIssues,
  } = usePlatform();

  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const displayedAlerts = filteredAlerts.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) {
      return false;
    }
    return true;
  });

  const criticalCount = filteredAlerts.filter((a) => a.severity === 'critical').length;
  const unreadCount = filteredAlerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400" />
            Security & Release Operational Alert Center
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              {unreadCount} Unread / {filteredAlerts.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Rule-based threshold alerts for critical CVE discoveries, SLA breaches, release date schedule slips, and candidate device BOM verification tasks.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Filter Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
          >
            <option value="all">All Alert Levels</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info Only</option>
          </select>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {displayedAlerts.map((alt) => {
          const isCritical = alt.severity === 'critical';
          const isHigh = alt.severity === 'high';
          const isWarning = alt.severity === 'warning';

          const borderClass = isCritical
            ? 'border-rose-700/80 bg-rose-950/20 shadow-sm shadow-rose-950/20'
            : isHigh
            ? 'border-amber-700/70 bg-amber-950/20'
            : isWarning
            ? 'border-amber-800/50 bg-slate-900'
            : 'border-slate-800 bg-slate-900';

          return (
            <div
              key={alt.id}
              className={`p-4 rounded-xl border transition-all ${borderClass} flex flex-col sm:flex-row sm:items-start justify-between gap-4`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  {isCritical ? (
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                  ) : isHigh ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Bell className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <h3 className="text-xs font-bold text-slate-100">{alt.title}</h3>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold font-mono ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : isHigh
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {alt.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {alt.message}
                </p>

                {/* Required Action Box */}
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 text-[11px] text-cyan-300 font-mono">
                  <strong className="text-slate-400 font-sans uppercase text-[10px] block mb-0.5">
                    Mandated Escalation Action:
                  </strong>
                  {alt.actionRequired}
                </div>

                {/* Metadata & Quick Jump Links */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Timestamp: <strong className="font-mono text-slate-300">{alt.timestamp}</strong></span>

                  {alt.cveId && (
                    <button
                      type="button"
                      onClick={() => {
                        const c = cves.find((item) => item.id === alt.cveId);
                        if (c) setSelectedCVE(c);
                      }}
                      className="text-rose-400 hover:underline font-mono inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Investigate {alt.cveId}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {alt.deviceId && (
                    <button
                      type="button"
                      onClick={() => {
                        const d = devices.find((item) => item.id === alt.deviceId);
                        if (d) setSelectedDevice(d);
                      }}
                      className="text-cyan-400 hover:underline font-mono inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Device {alt.deviceId} BOM</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Acknowledge Button */}
              <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                {alt.acknowledged ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Acknowledged
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => acknowledgeAlert(alt.id)}
                    className="px-3 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Acknowledge Alert
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
