import React, { useState, useEffect, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Search,
  X,
  Smartphone,
  ShieldAlert,
  GitPullRequest,
  Calendar,
  Layers,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { SeverityBadge, VerificationBadge } from '../common/Badges';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    devices,
    cves,
    jiraIssues,
    releases,
    platforms,
    setSelectedDevice,
    setSelectedCVE,
    setSelectedRelease,
    setSelectedJiraIssue,
    setActiveTab,
  } = usePlatform();

  const [query, setQuery] = useState('');

  // Handle keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  // Normalize query & check if it matches a CVE format
  const isCveFormat = useMemo(() => {
    return /^cve-\d{4}-\d{4,7}$/i.test(query.trim());
  }, [query]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    // Search devices
    const matchedDevices = devices.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.modelNumber.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.components.some((c) => c.toLowerCase().includes(q))
    );

    // Search CVEs
    const matchedCVEs = cves.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.officialDescription.toLowerCase().includes(q) ||
        c.affectedComponents.some((comp) => comp.toLowerCase().includes(q))
    );

    // Search Jira issues
    const matchedJira = jiraIssues.filter(
      (j) =>
        j.key.toLowerCase().includes(q) ||
        j.summary.toLowerCase().includes(q) ||
        j.component.toLowerCase().includes(q) ||
        j.assignee.toLowerCase().includes(q) ||
        j.labels.some((l) => l.toLowerCase().includes(q))
    );

    // Search Releases
    const matchedReleases = releases.filter(
      (r) =>
        r.version.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.releaseMonth.toLowerCase().includes(q) ||
        r.releaseOwner.toLowerCase().includes(q)
    );

    // Search Platforms
    const matchedPlatforms = platforms.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.codeName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );

    return {
      devices: matchedDevices,
      cves: matchedCVEs,
      jira: matchedJira,
      releases: matchedReleases,
      platforms: matchedPlatforms,
      totalCount:
        matchedDevices.length +
        matchedCVEs.length +
        matchedJira.length +
        matchedReleases.length +
        matchedPlatforms.length,
    };
  }, [query, devices, cves, jiraIssues, releases, platforms]);

  if (!isGlobalSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, device IDs (e.g. 4490, 33605, 5841), CVEs, Jira issues, releases..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={() => setIsGlobalSearchOpen(false)}
            className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        {/* Query Suggestions Pills */}
        {!query && (
          <div className="p-4 bg-slate-900/90 text-xs border-b border-slate-800">
            <span className="text-slate-400 font-semibold block mb-2">Example Intelligence Queries:</span>
            <div className="flex flex-wrap gap-2">
              {['4490', '33605', '5841', 'CVE-2026-21844', 'CVE-2026-38290', 'SEC-9102', 'Platform 1', 'October 2026'].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-2 py-1 rounded bg-slate-800/90 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-700 border border-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Specific CVE Investigation Protocol banner if query is CVE format */}
          {isCveFormat && (
            <div className="p-3 rounded-lg bg-slate-950 border border-indigo-700/60 text-xs">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>CVE Threat Intelligence Investigation Protocol</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Evaluating normalized CVE identifier <strong className="font-mono text-cyan-300">{query.toUpperCase()}</strong> against local indexed vulnerability catalog and vendor advisories. Externally published vulnerability information is strictly separated from internal Jira engineering remediation evidence.
              </p>
            </div>
          )}

          {/* If query has results */}
          {searchResults && searchResults.totalCount > 0 && (
            <div className="space-y-4">
              {/* Products & Devices */}
              {searchResults.devices.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Products & Devices ({searchResults.devices.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.devices.map((dev) => (
                      <div
                        key={dev.id}
                        onClick={() => {
                          setSelectedDevice(dev);
                          setIsGlobalSearchOpen(false);
                          setActiveTab('products');
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-300 font-bold text-xs">
                              {dev.id}
                            </span>
                            <span className="font-semibold text-slate-200 text-xs">{dev.name}</span>
                            <VerificationBadge state={dev.verificationState} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {dev.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {dev.productFamily}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CVE Vulnerabilities */}
              {searchResults.cves.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>CVE Security Records ({searchResults.cves.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.cves.map((cve) => (
                      <div
                        key={cve.id}
                        onClick={() => {
                          setSelectedCVE(cve);
                          setIsGlobalSearchOpen(false);
                          setActiveTab('cve');
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-rose-500/60 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-rose-300 font-bold text-xs">
                              {cve.id}
                            </span>
                            <SeverityBadge severity={cve.severity} score={cve.cvssScore} />
                            <span className="text-[11px] text-slate-300 font-medium truncate max-w-sm">
                              {cve.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <span>Source: <strong className="text-slate-300">{cve.sourceDatabase}</strong></span>
                            <span>•</span>
                            <span>Workflow: <strong className="text-cyan-300 capitalize">{cve.workflowStatus.replace('_', ' ')}</strong></span>
                            <span>•</span>
                            <span>Affected: {cve.affectedDeviceIds.join(', ')}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-slate-400 block">
                            Fix: {cve.fixVersion}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jira Issues */}
              {searchResults.jira.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Internal Jira Issues ({searchResults.jira.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.jira.map((issue) => (
                      <div
                        key={issue.key}
                        onClick={() => {
                          setSelectedJiraIssue(issue);
                          setIsGlobalSearchOpen(false);
                          setActiveTab('fixes');
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-300 font-bold text-xs">
                              {issue.key}
                            </span>
                            <span className="text-xs text-slate-200 font-medium">
                              {issue.summary}
                            </span>
                            {issue.isBlocker && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                                BLOCKER
                              </span>
                            )}
                            {issue.isCarryOver && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                CARRY-OVER
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Component: {issue.component} • Assignee: {issue.assignee}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-cyan-400 shrink-0">
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Releases */}
              {searchResults.releases.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Software Releases ({searchResults.releases.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.releases.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => {
                          setSelectedRelease(rel);
                          setIsGlobalSearchOpen(false);
                          setActiveTab('calendar');
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-purple-300 font-bold text-xs">
                              {rel.version}
                            </span>
                            <span className="text-xs text-slate-200 font-medium">{rel.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Target: {rel.plannedReleaseDate} • Readiness: {rel.readinessPercentage}% • Status: {rel.status}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {rel.releaseQuarter}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platforms */}
              {searchResults.platforms.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Platforms ({searchResults.platforms.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.platforms.map((plat) => (
                      <div
                        key={plat.id}
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          setActiveTab('platforms');
                        }}
                        className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-200 text-xs block">
                            {plat.name}
                          </span>
                          <span className="text-[11px] text-slate-400">{plat.codeName} • {plat.category}</span>
                        </div>
                        <span className="text-xs font-mono text-cyan-400">
                          Cur: {plat.currentRelease}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Zero results state */}
          {query && searchResults && searchResults.totalCount === 0 && (
            <div className="text-center py-12 px-4 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-200">
                No verified records found for "{query}"
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {isCveFormat ? (
                  <span className="text-amber-400/90 font-medium">
                    "No verified product impact found. This does not establish that the product is unaffected."
                  </span>
                ) : (
                  <span>
                    No matching products, candidate devices, CVEs, or Jira tickets matched your query. Check spelling or try searching by platform name (Platform 1-5).
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Search spans 5 platforms, 11 devices, 6 CVEs, 8 Jira issues</span>
          <span className="font-mono">Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
