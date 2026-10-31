import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Platform } from '../../types';
import {
  Layers,
  Smartphone,
  Calendar,
  ShieldAlert,
  GitPullRequest,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { VerificationBadge } from '../common/Badges';

export const PlatformsView: React.FC = () => {
  const {
    filteredPlatforms,
    devices,
    releases,
    cves,
    jiraIssues,
    setSelectedDevice,
    setSelectedRelease,
    setSelectedCVE,
    setActiveTab,
    updateFilter,
  } = usePlatform();

  const [activePlatformId, setActivePlatformId] = useState<string>(
    filteredPlatforms[0]?.id || 'platform-1'
  );

  const selectedPlatform =
    filteredPlatforms.find((p) => p.id === activePlatformId) || filteredPlatforms[0];

  if (!selectedPlatform) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        No platform matches the current filter criteria. Reset filters to view all 5 platforms.
      </div>
    );
  }

  const mappedDevices = devices.filter((d) => d.platformId === selectedPlatform.id);
  const platformReleases = releases.filter((r) => r.platformId === selectedPlatform.id);
  const platformCVEs = cves.filter((c) =>
    c.affectedPlatformIds.includes(selectedPlatform.id)
  );
  const platformJira = jiraIssues.filter((j) => j.platformId === selectedPlatform.id);

  return (
    <div className="space-y-6">
      {/* Platform Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {filteredPlatforms.map((plat) => {
          const isSelected = plat.id === selectedPlatform.id;
          return (
            <button
              key={plat.id}
              type="button"
              onClick={() => setActivePlatformId(plat.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200 shadow-sm shadow-cyan-950'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="w-5 h-5 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center font-mono text-[10px] text-cyan-300">
                P{plat.numericId}
              </span>
              <span>{plat.name.split(':')[1] || plat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Platform Header & Overview */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="font-mono text-cyan-300 font-extrabold text-xs px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                Platform {selectedPlatform.numericId}
              </span>
              <h2 className="text-base font-bold text-white">{selectedPlatform.name}</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Architecture Core: <strong className="text-slate-200">{selectedPlatform.codeName}</strong> • {selectedPlatform.category}
            </p>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {selectedPlatform.description}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Quality Gate Readiness
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {selectedPlatform.releaseReadinessScore}%
              </span>
              <span className="text-xs text-slate-400">Target: 95%</span>
            </div>
            <div className="w-36 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full"
                style={{ width: `${selectedPlatform.releaseReadinessScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Ownership & Leadership */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              Platform Engineering VP
            </span>
            <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              {selectedPlatform.platformOwner}
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              Product Solutions Lead
            </span>
            <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              {selectedPlatform.productManager}
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              Chief Technical Lead
            </span>
            <p className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              {selectedPlatform.technicalLead}
            </p>
          </div>
        </div>

        {/* Release cadences */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              Current Release
            </span>
            <p className="font-mono font-bold text-slate-200 mt-0.5">
              {selectedPlatform.currentRelease}
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              Next Planned Target
            </span>
            <p className="font-mono font-bold text-cyan-300 mt-0.5">
              {selectedPlatform.nextPlannedRelease}
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              Latest In-Field LTS
            </span>
            <p className="font-mono font-bold text-purple-300 mt-0.5">
              {selectedPlatform.latestReleasedVersion}
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">
              Release Cadence
            </span>
            <p className="text-slate-300 mt-0.5 text-[11px]">
              {selectedPlatform.releaseCadence}
            </p>
          </div>
        </div>
      </div>

      {/* Mapped Devices Grid */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            Devices Mapped to Platform {selectedPlatform.numericId} ({mappedDevices.length})
          </h3>
          <button
            type="button"
            onClick={() => {
              updateFilter('platformIds', [selectedPlatform.id]);
              setActiveTab('products');
            }}
            className="text-xs text-cyan-400 hover:underline font-medium cursor-pointer"
          >
            Open Full Catalog Filter →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mappedDevices.map((dev) => (
            <div
              key={dev.id}
              onClick={() => setSelectedDevice(dev)}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/70 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-cyan-300 font-extrabold text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                  {dev.id}
                </span>
                <VerificationBadge state={dev.verificationState} size="sm" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-xs group-hover:text-cyan-300 transition-colors">
                  {dev.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  {dev.hardwareGeneration}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Release: {dev.latestVerifiedRelease}</span>
                {dev.openRelevantCVECount > 0 ? (
                  <span className="text-rose-400 font-bold">{dev.openRelevantCVECount} CVEs</span>
                ) : (
                  <span className="text-emerald-400">Zero CVEs</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Release Timeline & History */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          Release Schedule & History ({platformReleases.length} tracked)
        </h3>

        <div className="space-y-2">
          {platformReleases.map((rel) => (
            <div
              key={rel.id}
              onClick={() => setSelectedRelease(rel)}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/70 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-purple-300 font-bold text-xs">
                    {rel.version}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{rel.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                    {rel.releaseType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-xl line-clamp-1">
                  {rel.customerReleaseNotes}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Target Date</span>
                  <span className="text-slate-200">{rel.plannedReleaseDate}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Readiness</span>
                  <span className="text-cyan-400 font-bold">{rel.readinessPercentage}%</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                    rel.status === 'released'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : rel.status === 'at_risk'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : rel.status === 'delayed'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  {rel.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
