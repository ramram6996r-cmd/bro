import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  X,
  Calendar,
  Layers,
  CheckSquare,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Smartphone,
  GitPullRequest,
  FileText,
  User,
  AlertCircle,
} from 'lucide-react';
import { ReleaseStatusBadge } from '../common/Badges';

export const ReleaseDetailModal: React.FC = () => {
  const {
    selectedRelease,
    setSelectedRelease,
    platforms,
    devices,
    jiraIssues,
    setSelectedDevice,
    setSelectedJiraIssue,
    canViewInternalTechNotes,
  } = usePlatform();

  if (!selectedRelease) return null;

  const platform = platforms.find((p) => p.id === selectedRelease.platformId);
  const targetDevices = devices.filter((d) =>
    selectedRelease.targetDeviceIds.includes(d.id)
  );
  const relevantJira = jiraIssues.filter((j) =>
    selectedRelease.associatedJiraKeys.includes(j.key)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="font-mono text-purple-300 font-extrabold text-lg px-2.5 py-0.5 rounded bg-purple-950/80 border border-purple-800">
              {selectedRelease.version}
            </span>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-100">
                {selectedRelease.name}
              </h2>
              <span className="text-xs text-slate-400">
                {platform?.name} • Cadence Month: {selectedRelease.releaseMonth} ({selectedRelease.releaseQuarter})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReleaseStatusBadge status={selectedRelease.status} />
            <button
              type="button"
              onClick={() => setSelectedRelease(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Delay / Risk Banner */}
          {selectedRelease.isDelayed && (
            <div className="p-3.5 rounded-lg bg-amber-950/70 border border-amber-600/80 text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Release Schedule Notice: Delay or Blocker In Effect</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedRelease.delayReason || 'Release is tracking behind baseline schedule.'}
              </p>
              <div className="text-[11px] text-amber-300 font-mono pt-1">
                Original Target: {selectedRelease.originalTargetDate} → Revised Forecast: {selectedRelease.forecastDate}
              </div>
            </div>
          )}

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Readiness Score
              </span>
              <p className="text-xl font-bold font-mono text-cyan-400">
                {selectedRelease.readinessPercentage}%
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{ width: `${selectedRelease.readinessPercentage}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Target Date
              </span>
              <p className="text-base font-bold font-mono text-slate-200">
                {selectedRelease.actualReleaseDate || selectedRelease.plannedReleaseDate}
              </p>
              <span className="text-[10px] text-slate-500">
                Owner: {selectedRelease.releaseOwner}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Fixes & Security
              </span>
              <p className="text-base font-bold font-mono text-emerald-400">
                {selectedRelease.bugFixesCount} Bugs / {selectedRelease.securityFixesCount} CVEs
              </p>
              <span className="text-[10px] text-slate-500">
                {selectedRelease.newFeaturesCount} new features
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Carry-Over Issues
              </span>
              <p className="text-base font-bold font-mono text-amber-400">
                {selectedRelease.carriedOverIssuesCount} Issues
              </p>
              <span className="text-[10px] text-slate-500">Deferred from previous month</span>
            </div>
          </div>

          {/* Release Readiness Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              Quality Gate & Readiness Checklist ({selectedRelease.checklist.filter(c => c.isMet).length}/{selectedRelease.checklist.length} Passed)
            </h4>
            <div className="space-y-1.5">
              {selectedRelease.checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                    item.isMet
                      ? 'bg-slate-950/80 border-slate-800/80 text-slate-200'
                      : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.isMet ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold">{item.criterion}</span>
                      <p className="text-[11px] text-slate-400">{item.evidence}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Owner: {item.owner}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        item.isMet ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.isMet ? 'PASSED' : 'BLOCKING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-400" />
              Milestone Progression
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {selectedRelease.milestones.map((m) => (
                <div
                  key={m.name}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1"
                >
                  <span className="font-semibold text-slate-200 block truncate">{m.name}</span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Target: {m.targetDate}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase ${
                      m.status === 'completed'
                        ? 'text-emerald-400'
                        : m.status === 'delayed'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Facing Release Notes */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Customer-Facing Release Bulletin
            </h4>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              {selectedRelease.customerReleaseNotes}
            </div>
          </div>

          {/* Internal Technical Notes (Role-Restricted) */}
          {canViewInternalTechNotes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                Internal Engineering & BSP Notes (Restricted)
              </h4>
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/60 text-xs text-amber-200/90 leading-relaxed font-mono">
                {selectedRelease.internalTechnicalNotes}
              </div>
            </div>
          )}

          {/* Affected Target Devices */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Target Hardware & Device BOMs ({targetDevices.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {targetDevices.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDevice(d)}
                  className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 cursor-pointer text-xs"
                >
                  <span className="font-mono font-bold text-cyan-300 block">{d.id}</span>
                  <span className="text-[11px] text-slate-400 truncate block">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedRelease(null)}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
