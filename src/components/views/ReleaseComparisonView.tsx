import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Release } from '../../types';
import {
  GitCompare,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Smartphone,
  Layers,
  Clock,
  Sparkles,
  Bug,
} from 'lucide-react';
import { ReleaseStatusBadge } from '../common/Badges';

export const ReleaseComparisonView: React.FC = () => {
  const {
    releases,
    platforms,
    devices,
    cves,
    jiraIssues,
    setSelectedRelease,
    setSelectedCVE,
    setSelectedJiraIssue,
    setSelectedDevice,
  } = usePlatform();

  const [baseReleaseId, setBaseReleaseId] = useState<string>(
    releases.find((r) => r.version.includes('2026.09'))?.id || releases[0]?.id || ''
  );
  const [targetReleaseId, setTargetReleaseId] = useState<string>(
    releases.find((r) => r.version.includes('2026.10'))?.id || releases[1]?.id || ''
  );

  const baseRelease = releases.find((r) => r.id === baseReleaseId);
  const targetRelease = releases.find((r) => r.id === targetReleaseId);

  if (!baseRelease || !targetRelease) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Select two releases to perform comparison.
      </div>
    );
  }

  // Calculate diff metrics
  const bugDiff = targetRelease.bugFixesCount - baseRelease.bugFixesCount;
  const secDiff = targetRelease.securityFixesCount - baseRelease.securityFixesCount;
  const carryOverDiff = targetRelease.carriedOverIssuesCount - baseRelease.carriedOverIssuesCount;

  // Associated CVEs
  const baseCVEs = cves.filter((c) => baseRelease.associatedCVEs.includes(c.id));
  const targetCVEs = cves.filter((c) => targetRelease.associatedCVEs.includes(c.id));

  // Newly addressed CVEs in target release
  const newlyAddressedCVEs = targetCVEs.filter(
    (c) => !baseRelease.associatedCVEs.includes(c.id)
  );

  // Associated Jira
  const baseJira = jiraIssues.filter((j) => baseRelease.associatedJiraKeys.includes(j.key));
  const targetJira = jiraIssues.filter((j) => targetRelease.associatedJiraKeys.includes(j.key));

  return (
    <div className="space-y-6">
      {/* Title & Selectors */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-purple-400" />
          <h1 className="text-base font-bold text-white">
            Release Diff & Delta Comparison Engine
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Compare scope changes, newly addressed vulnerabilities, regressions, carried-over technical debt, and supported hardware BOMs between two release builds.
        </p>

        {/* Release Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Base Baseline Release (Earlier)
            </label>
            <select
              value={baseReleaseId}
              onChange={(e) => setBaseReleaseId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {releases.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.version} — {r.name} ({r.releaseMonth})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              Target Candidate Release (Newer)
            </label>
            <select
              value={targetReleaseId}
              onChange={(e) => setTargetReleaseId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-cyan-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {releases.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.version} — {r.name} ({r.releaseMonth})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Delta Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            Bug Fixes Delta
          </span>
          <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {bugDiff >= 0 ? `+${bugDiff}` : `${bugDiff}`}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {baseRelease.bugFixesCount} → {targetRelease.bugFixesCount} fixes
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            Security Fixes Delta
          </span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {secDiff >= 0 ? `+${secDiff}` : `${secDiff}`}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {baseRelease.securityFixesCount} → {targetRelease.securityFixesCount} CVEs
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            Carry-Over Delta
          </span>
          <p
            className={`text-xl font-bold font-mono mt-1 ${
              carryOverDiff > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {carryOverDiff >= 0 ? `+${carryOverDiff}` : `${carryOverDiff}`}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {baseRelease.carriedOverIssuesCount} → {targetRelease.carriedOverIssuesCount} deferred
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            Readiness Gap
          </span>
          <p className="text-xl font-bold font-mono text-purple-400 mt-1">
            {targetRelease.readinessPercentage - baseRelease.readinessPercentage}%
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {baseRelease.readinessPercentage}% → {targetRelease.readinessPercentage}%
          </span>
        </div>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Baseline Release Card */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-300 font-bold">
                BASELINE: {baseRelease.version}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1">{baseRelease.name}</h3>
              <p className="text-[11px] text-slate-400">Target: {baseRelease.plannedReleaseDate}</p>
            </div>
            <ReleaseStatusBadge status={baseRelease.status} />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Release Bulletin
            </span>
            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/80 leading-relaxed">
              {baseRelease.customerReleaseNotes}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Associated Jira Issues ({baseJira.length})
            </span>
            <div className="space-y-1">
              {baseJira.map((j) => (
                <div
                  key={j.key}
                  onClick={() => setSelectedJiraIssue(j)}
                  className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="font-mono text-emerald-400 font-bold">{j.key}</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{j.summary}</span>
                  <span className="text-[10px] font-mono text-slate-400">{j.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Target Release Card */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-800/60 shadow-lg shadow-cyan-950/20 space-y-4">
          <div className="flex items-start justify-between border-b border-cyan-900/40 pb-3">
            <div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                CANDIDATE: {targetRelease.version}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mt-1">{targetRelease.name}</h3>
              <p className="text-[11px] text-cyan-400">Target: {targetRelease.plannedReleaseDate}</p>
            </div>
            <ReleaseStatusBadge status={targetRelease.status} />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Release Bulletin
            </span>
            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/80 leading-relaxed">
              {targetRelease.customerReleaseNotes}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Associated Jira Issues ({targetJira.length})
            </span>
            <div className="space-y-1">
              {targetJira.map((j) => (
                <div
                  key={j.key}
                  onClick={() => setSelectedJiraIssue(j)}
                  className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-cyan-600 text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="font-mono text-emerald-400 font-bold">{j.key}</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{j.summary}</span>
                  <span className="text-[10px] font-mono text-slate-400">{j.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newly Addressed Vulnerabilities Callout */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          CVE Vulnerabilities Addressed in {targetRelease.version} ({newlyAddressedCVEs.length} new)
        </h3>

        {newlyAddressedCVEs.length === 0 ? (
          <p className="text-xs text-slate-500 bg-slate-950 p-3 rounded border border-slate-800">
            No newly addressed CVEs in this delta comparison.
          </p>
        ) : (
          <div className="space-y-2">
            {newlyAddressedCVEs.map((cve) => (
              <div
                key={cve.id}
                onClick={() => setSelectedCVE(cve)}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-600 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">{cve.id}</span>
                    <span className="font-semibold text-slate-200">{cve.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cve.internalImpactAssessment}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">CVSS {cve.cvssScore}</span>
                  <span className="text-[10px] text-cyan-400 font-bold">Fix Packaged</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
