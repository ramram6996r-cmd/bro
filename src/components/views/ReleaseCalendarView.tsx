import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Release, ReleaseStatus } from '../../types';
import { ReleaseStatusBadge } from '../common/Badges';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Smartphone,
  ChevronRight,
  Filter,
  CheckSquare,
  ShieldCheck,
  LayoutGrid,
  List,
} from 'lucide-react';

export const ReleaseCalendarView: React.FC = () => {
  const {
    filteredReleases,
    setSelectedRelease,
    platforms,
    devices,
    setSelectedDevice,
    updateFilter,
    filters,
  } = usePlatform();

  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  const months = ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01'];

  const monthNames: Record<string, string> = {
    '2026-08': 'August 2026',
    '2026-09': 'September 2026',
    '2026-10': 'October 2026 (Active)',
    '2026-11': 'November 2026 (Upcoming)',
    '2026-12': 'December 2026',
    '2027-01': 'Q1 2027 (Future)',
  };

  const releasesInSelectedMonth = filteredReleases.filter(
    (r) => r.releaseMonth === selectedMonth
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-400" />
            Enterprise Release Intelligence Calendar
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {filteredReleases.length} Releases Tracked
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Planned, forecast, and actual release milestones across all 5 Zebra software platforms with quality gate checklists.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'calendar'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Monthly Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'timeline'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Detailed List</span>
          </button>
        </div>
      </div>

      {/* Month Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Cadence Cycle:
        </span>
        {months.map((m) => {
          const isSelected = selectedMonth === m;
          const countInMonth = filteredReleases.filter((r) => r.releaseMonth === m).length;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-purple-950 border-purple-500/80 text-purple-200 font-bold shadow-sm shadow-purple-950'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{monthNames[m] || m}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {countInMonth}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid or Timeline or List View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {releasesInSelectedMonth.map((rel) => {
            const plat = platforms.find((p) => p.id === rel.platformId);
            return (
              <div
                key={rel.id}
                onClick={() => setSelectedRelease(rel)}
                className={`p-4 rounded-xl border bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between group ${
                  rel.isDelayed
                    ? 'border-amber-700/80 hover:border-amber-500 shadow-sm shadow-amber-950/20'
                    : 'border-slate-800 hover:border-purple-500/70 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-extrabold">
                        {rel.version}
                      </span>
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-purple-300 transition-colors mt-2">
                        {rel.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {plat?.name.split(':')[0]} ({plat?.codeName})
                      </p>
                    </div>
                    <ReleaseStatusBadge status={rel.status} />
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {rel.customerReleaseNotes}
                  </p>

                  {/* Delay Warning */}
                  {rel.isDelayed && (
                    <div className="p-2 rounded bg-amber-950/50 border border-amber-800/60 text-[11px] text-amber-200">
                      <span className="font-bold flex items-center gap-1 text-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        Slip Notice:
                      </span>
                      <span className="line-clamp-2 mt-0.5">{rel.delayReason}</span>
                    </div>
                  )}

                  {/* Quality Gate Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Readiness Score</span>
                      <span
                        className={`font-bold ${
                          rel.readinessPercentage === 100
                            ? 'text-emerald-400'
                            : rel.readinessPercentage < 75
                            ? 'text-amber-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {rel.readinessPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          rel.readinessPercentage === 100
                            ? 'bg-emerald-500'
                            : rel.readinessPercentage < 75
                            ? 'bg-amber-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${rel.readinessPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div>
                    <span className="block text-[10px] text-slate-500">Target Date</span>
                    <span className="text-slate-200 font-bold">
                      {rel.actualReleaseDate || rel.plannedReleaseDate}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-500">Bugs / CVEs</span>
                    <span className="text-cyan-300 font-bold">
                      {rel.bugFixesCount} / {rel.securityFixesCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Release Sequence & Milestone Chronology
          </h3>
          <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
            {releasesInSelectedMonth.map((rel) => (
              <div key={rel.id} className="relative group cursor-pointer" onClick={() => setSelectedRelease(rel)}>
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-500 group-hover:bg-purple-500 transition-colors" />
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-purple-500 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-purple-300 font-bold text-xs">{rel.version}</span>
                      <span className="font-semibold text-slate-100 text-xs">{rel.name}</span>
                    </div>
                    <ReleaseStatusBadge status={rel.status} />
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{rel.customerReleaseNotes}</p>
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                    <span>Target: <strong className="text-slate-200">{rel.plannedReleaseDate}</strong></span>
                    <span>Forecast: <strong className="text-cyan-300">{rel.forecastDate}</strong></span>
                    <span>Readiness: <strong className="text-emerald-400">{rel.readinessPercentage}%</strong></span>
                    <span>Devices: {rel.targetDeviceIds.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Version</th>
                  <th className="p-3">Release Name</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Target Date</th>
                  <th className="p-3">Forecast</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Readiness</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReleases.map((rel) => {
                  const plat = platforms.find((p) => p.id === rel.platformId);
                  return (
                    <tr
                      key={rel.id}
                      onClick={() => setSelectedRelease(rel)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="p-3 font-mono font-bold text-purple-300">{rel.version}</td>
                      <td className="p-3 font-semibold text-slate-200">{rel.name}</td>
                      <td className="p-3 font-mono text-[11px] text-cyan-300">
                        {plat ? `P${plat.numericId}` : `Platform ${rel.platformNumericId}`}
                      </td>
                      <td className="p-3 uppercase text-[10px] font-mono text-slate-400">
                        {rel.releaseType}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{rel.plannedReleaseDate}</td>
                      <td className="p-3 font-mono text-slate-300">{rel.forecastDate}</td>
                      <td className="p-3">
                        <ReleaseStatusBadge status={rel.status} />
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-400">
                        {rel.readinessPercentage}%
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
