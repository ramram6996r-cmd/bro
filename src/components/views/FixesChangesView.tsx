import React, { useState, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { JiraIssue, JiraStatus, JiraIssueType } from '../../types';
import { JiraStatusBadge } from '../common/Badges';
import {
  GitPullRequest,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  Smartphone,
  ShieldAlert,
  ArrowUpDown,
  FileDown,
} from 'lucide-react';

export const FixesChangesView: React.FC = () => {
  const {
    filteredJiraIssues,
    setSelectedJiraIssue,
    setSelectedDevice,
    setSelectedCVE,
    devices,
    cves,
    platforms,
    canViewInternalTechNotes,
  } = usePlatform();

  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showOnlyCarryOver, setShowOnlyCarryOver] = useState(false);
  const [showOnlyBlockers, setShowOnlyBlockers] = useState(false);

  const carryOverCount = filteredJiraIssues.filter((j) => j.isCarryOver).length;
  const blockerCount = filteredJiraIssues.filter((j) => j.isBlocker).length;
  const resolvedCount = filteredJiraIssues.filter(
    (j) => j.status === 'Resolved' || j.status === 'Closed'
  ).length;

  const displayedIssues = useMemo(() => {
    return filteredJiraIssues.filter((issue) => {
      if (showOnlyCarryOver && !issue.isCarryOver) return false;
      if (showOnlyBlockers && !issue.isBlocker) return false;
      if (filterType !== 'all' && issue.issueType !== filterType) return false;

      if (!localSearch) return true;
      const q = localSearch.toLowerCase();
      return (
        issue.key.toLowerCase().includes(q) ||
        issue.summary.toLowerCase().includes(q) ||
        issue.component.toLowerCase().includes(q) ||
        issue.assignee.toLowerCase().includes(q) ||
        issue.labels.some((l) => l.toLowerCase().includes(q))
      );
    });
  }, [filteredJiraIssues, showOnlyCarryOver, showOnlyBlockers, filterType, localSearch]);

  const exportJiraCSV = () => {
    const headers = [
      'Key',
      'Summary',
      'Type',
      'Status',
      'Priority',
      'Platform',
      'Component',
      'Fix Version',
      'Blocker',
      'Carry-Over',
      'Assignee',
    ];
    const rows = displayedIssues.map((j) => [
      `"${j.key}"`,
      `"${j.summary}"`,
      `"${j.issueType}"`,
      `"${j.status}"`,
      `"${j.priority}"`,
      `"${j.platformId}"`,
      `"${j.component}"`,
      `"${j.fixVersion}"`,
      j.isBlocker ? 'YES' : 'NO',
      j.isCarryOver ? 'YES' : 'NO',
      `"${j.assignee}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zebra-jira-fixes-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-emerald-400" />
            Jira Issues, Fixes & Carry-Over Intelligence
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {filteredJiraIssues.length} Issues Tracked
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal Jira sync containing bug fixes, carry-overs from previous releases, critical blockers, and verified patches.
          </p>
        </div>

        <button
          type="button"
          onClick={exportJiraCSV}
          className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Jira CSV</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setShowOnlyBlockers(!showOnlyBlockers)}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
            showOnlyBlockers
              ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md shadow-rose-950'
              : 'bg-slate-900 border-slate-800 hover:border-rose-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Critical Blocker Defects
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{blockerCount}</p>
          <span className="text-[10px] text-slate-400">
            {showOnlyBlockers ? 'Active filter: click to clear' : 'Click to filter blockers only'}
          </span>
        </div>

        <div
          onClick={() => setShowOnlyCarryOver(!showOnlyCarryOver)}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
            showOnlyCarryOver
              ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md shadow-amber-950'
              : 'bg-slate-900 border-slate-800 hover:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Carried-Over Issues
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{carryOverCount}</p>
          <span className="text-[10px] text-slate-400">
            {showOnlyCarryOver ? 'Active filter: click to clear' : 'Deferred from earlier sprints'}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-emerald-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Resolved in Current Cycle
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{resolvedCount}</p>
          <span className="text-[10px] text-slate-400">Verified and ready for deployment</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search Jira key (e.g. ZEB-4821), summary, or assignee..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Issue Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Issue Types</option>
            <option value="Bug">Bug</option>
            <option value="Security Vulnerability">Security Vulnerability</option>
            <option value="Regression">Regression</option>
            <option value="Story">Story</option>
            <option value="Task">Task</option>
          </select>
        </div>
      </div>

      {/* Jira Issues Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3">Issue Key</th>
                <th className="p-3">Summary & Details</th>
                <th className="p-3">Component / Team</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Fix Version</th>
                <th className="p-3">Assignee</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedIssues.map((issue) => (
                <tr
                  key={issue.key}
                  onClick={() => setSelectedJiraIssue(issue)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="p-3">
                    <span className="font-mono font-bold text-emerald-300 text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                      {issue.key}
                    </span>
                    {issue.isBlocker && (
                      <span className="block text-[10px] font-bold text-rose-400 font-mono mt-1">
                        ● BLOCKER
                      </span>
                    )}
                    {issue.isCarryOver && (
                      <span className="block text-[10px] font-bold text-amber-400 font-mono mt-0.5">
                        ↳ CARRY-OVER
                      </span>
                    )}
                  </td>
                  <td className="p-3 max-w-md">
                    <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors block">
                      {issue.summary}
                    </span>
                    {issue.customerFacingDescription ? (
                      <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {issue.customerFacingDescription}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono line-clamp-1 mt-0.5">
                        {issue.internalTechnicalDetails}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-300">
                    {issue.component}
                    <span className="block text-[10px] text-slate-500">{issue.team}</span>
                  </td>
                  <td className="p-3">
                    <JiraStatusBadge status={issue.status} />
                  </td>
                  <td className="p-3 font-semibold text-slate-300 text-[11px]">
                    {issue.priority}
                  </td>
                  <td className="p-3 font-mono text-cyan-300 text-[11px] font-semibold">
                    {issue.fixVersion}
                  </td>
                  <td className="p-3 text-slate-300 text-[11px]">
                    {issue.assignee}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
