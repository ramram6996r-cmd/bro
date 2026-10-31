import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Filter,
  X,
  Bookmark,
  ChevronDown,
  RotateCcw,
  Layers,
  Smartphone,
  Calendar,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CVESeverity, ReleaseStatus } from '../../types';

export const FilterBar: React.FC = () => {
  const {
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    savedPresets,
    applyPreset,
    saveNewPreset,
    platforms,
    devices,
    releases,
    filteredDevices,
    filteredReleases,
    filteredCVEs,
    filteredJiraIssues,
  } = usePlatform();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    saveNewPreset(presetName.trim(), presetDesc.trim() || 'Custom user filter combination');
    setPresetName('');
    setPresetDesc('');
    setSaveModalOpen(false);
  };

  const availableMonths = Array.from(new Set(releases.map((r) => r.releaseMonth))).sort().reverse();
  const availableSeverities: CVESeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const availableStatuses: ReleaseStatus[] = ['released', 'on_track', 'at_risk', 'delayed', 'planned'];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 space-y-2">
      {/* Top row: Filter selectors & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filters:</span>
          </div>

          {/* Platform Multi-Select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('platform')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                filters.platformIds.length > 0
                  ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>
                Platform
                {filters.platformIds.length > 0 ? ` (${filters.platformIds.length})` : ''}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'platform' && (
              <div className="absolute left-0 mt-1.5 w-72 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
                  Filter by 5 Core Zebra Platforms:
                </div>
                <div className="space-y-1">
                  {platforms.map((p) => {
                    const checked = filters.platformIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('platformIds', [...filters.platformIds, p.id]);
                            } else {
                              updateFilter(
                                'platformIds',
                                filters.platformIds.filter((id) => id !== p.id)
                              );
                            }
                          }}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-950"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Device Multi-Select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('device')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                filters.deviceIds.length > 0
                  ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Smartphone className="w-3 h-3 text-cyan-400" />
              <span>
                Device / ID
                {filters.deviceIds.length > 0 ? ` (${filters.deviceIds.length})` : ''}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'device' && (
              <div className="absolute left-0 mt-1.5 w-80 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
                <div className="text-[11px] font-semibold text-slate-400 mb-1 px-1">
                  Candidate & Verified Devices:
                </div>
                <div className="space-y-1">
                  {devices.map((d) => {
                    const checked = filters.deviceIds.includes(d.id);
                    return (
                      <label
                        key={d.id}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFilter('deviceIds', [...filters.deviceIds, d.id]);
                              } else {
                                updateFilter(
                                  'deviceIds',
                                  filters.deviceIds.filter((id) => id !== d.id)
                                );
                              }
                            }}
                            className="rounded border-slate-700 text-cyan-500 bg-slate-950"
                          />
                          <span className="font-mono text-cyan-300 font-semibold">{d.id}</span>
                          <span className="truncate text-slate-400 text-[11px]">{d.name}</span>
                        </div>
                        {d.isExampleIdentifier && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 rounded shrink-0">
                            Candidate
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Release Month Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('month')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                filters.releaseMonths.length > 0
                  ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>
                Month
                {filters.releaseMonths.length > 0 ? ` (${filters.releaseMonths.join(', ')})` : ''}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'month' && (
              <div className="absolute left-0 mt-1.5 w-52 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 mb-1 px-1">
                  Release Cadence Month:
                </div>
                <div className="space-y-1">
                  {availableMonths.map((m) => {
                    const checked = filters.releaseMonths.includes(m);
                    return (
                      <label
                        key={m}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('releaseMonths', [...filters.releaseMonths, m]);
                            } else {
                              updateFilter(
                                'releaseMonths',
                                filters.releaseMonths.filter((item) => item !== m)
                              );
                            }
                          }}
                          className="rounded border-slate-700 text-cyan-500 bg-slate-950"
                        />
                        <span className="font-mono">{m}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CVE Severity Multi-Select */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('severity')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                filters.cveSeverities.length > 0
                  ? 'bg-rose-950/70 border-rose-500/70 text-rose-200 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>
                CVE Severity
                {filters.cveSeverities.length > 0 ? ` (${filters.cveSeverities.length})` : ''}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'severity' && (
              <div className="absolute left-0 mt-1.5 w-48 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="space-y-1">
                  {availableSeverities.map((sev) => {
                    const checked = filters.cveSeverities.includes(sev);
                    return (
                      <label
                        key={sev}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-xs text-slate-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('cveSeverities', [...filters.cveSeverities, sev]);
                            } else {
                              updateFilter(
                                'cveSeverities',
                                filters.cveSeverities.filter((s) => s !== sev)
                              );
                            }
                          }}
                          className="rounded border-slate-700 text-rose-500 bg-slate-950"
                        />
                        <span className="font-semibold text-xs">{sev}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Release Status Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('status')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                filters.releaseStatuses.length > 0
                  ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-200 font-medium'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>
                Status
                {filters.releaseStatuses.length > 0 ? ` (${filters.releaseStatuses.length})` : ''}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'status' && (
              <div className="absolute left-0 mt-1.5 w-48 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="space-y-1">
                  {availableStatuses.map((st) => {
                    const checked = filters.releaseStatuses.includes(st);
                    return (
                      <label
                        key={st}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-xs text-slate-200 cursor-pointer capitalize"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter('releaseStatuses', [...filters.releaseStatuses, st]);
                            } else {
                              updateFilter(
                                'releaseStatuses',
                                filters.releaseStatuses.filter((s) => s !== st)
                              );
                            }
                          }}
                          className="rounded border-slate-700 text-cyan-500 bg-slate-950"
                        />
                        <span>{st.replace('_', ' ')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reset Filters button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 px-2 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded transition-colors cursor-pointer font-medium"
              title="Clear all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Saved Filter Presets Dropdown & Action */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('presets')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 text-xs transition-colors cursor-pointer"
            >
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>Saved Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {activeDropdown === 'presets' && (
              <div className="absolute right-0 mt-1.5 w-72 rounded-lg bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 divide-y divide-slate-800">
                <div className="pb-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 px-1 mb-1">
                    Quick Preset Views:
                  </div>
                  {savedPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        applyPreset(preset.id);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-xs transition-colors cursor-pointer"
                    >
                      <div className="font-semibold text-cyan-300">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      setSaveModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    <Bookmark className="w-3 h-3 text-amber-400" />
                    <span>Save Current View as Preset</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active matched counts live badge */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span>
              <strong className="text-cyan-300 font-bold">{filteredDevices.length}</strong> devices
            </span>
            <span className="text-slate-700">•</span>
            <span>
              <strong className="text-cyan-300 font-bold">{filteredReleases.length}</strong> releases
            </span>
            <span className="text-slate-700">•</span>
            <span>
              <strong className="text-rose-400 font-bold">{filteredCVEs.length}</strong> CVEs
            </span>
            <span className="text-slate-700">•</span>
            <span>
              <strong className="text-emerald-400 font-bold">{filteredJiraIssues.length}</strong> Jira
            </span>
          </div>
        </div>
      </div>

      {/* Bottom row: Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60 text-xs">
          <span className="text-[11px] text-slate-400 mr-1">Active:</span>

          {filters.platformIds.map((pId) => {
            const p = platforms.find((item) => item.id === pId);
            return (
              <span
                key={pId}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px]"
              >
                <span>{p ? p.name.split(':')[0] : pId}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateFilter(
                      'platformIds',
                      filters.platformIds.filter((id) => id !== pId)
                    )
                  }
                  className="hover:text-cyan-100"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            );
          })}

          {filters.deviceIds.map((dId) => (
            <span
              key={dId}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 text-[11px] font-mono"
            >
              <span>Device {dId}</span>
              <button
                type="button"
                onClick={() =>
                  updateFilter(
                    'deviceIds',
                    filters.deviceIds.filter((id) => id !== dId)
                  )
                }
                className="hover:text-blue-100"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}

          {filters.releaseMonths.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[11px] font-mono"
            >
              <span>{m}</span>
              <button
                type="button"
                onClick={() =>
                  updateFilter(
                    'releaseMonths',
                    filters.releaseMonths.filter((id) => id !== m)
                  )
                }
                className="hover:text-purple-100"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}

          {filters.cveSeverities.map((sev) => (
            <span
              key={sev}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[11px] font-bold"
            >
              <span>{sev}</span>
              <button
                type="button"
                onClick={() =>
                  updateFilter(
                    'cveSeverities',
                    filters.cveSeverities.filter((s) => s !== sev)
                  )
                }
                className="hover:text-rose-100"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}

          {filters.releaseStatuses.map((st) => (
            <span
              key={st}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] capitalize"
            >
              <span>{st.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() =>
                  updateFilter(
                    'releaseStatuses',
                    filters.releaseStatuses.filter((s) => s !== st)
                  )
                }
                className="hover:text-slate-100"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Save Preset Dialog Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                Save Custom Filter Preset
              </h3>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePreset} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  required
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g. Platform 3 High Risk Aurora Audit"
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={presetDesc}
                  onChange={(e) => setPresetDesc(e.target.value)}
                  placeholder="Brief note on stakeholder context or review cadence..."
                  className="w-full px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white cursor-pointer"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
