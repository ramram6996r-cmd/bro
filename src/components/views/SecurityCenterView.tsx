import React, { useState, useMemo } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { CVEItem, CVESeverity, CVEWorkflowStatus } from '../../types';
import { SeverityBadge, VerificationBadge } from '../common/Badges';
import {
  ShieldAlert,
  Search,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Smartphone,
  Filter,
  FileDown,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const SecurityCenterView: React.FC = () => {
  const {
    filteredCVEs,
    setSelectedCVE,
    devices,
    platforms,
    triggerDataSync,
    isSyncing,
    role,
    canViewRestrictedExploits,
    updateFilter,
    filters,
  } = usePlatform();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedWorkflowFilter, setSelectedWorkflowFilter] = useState<string>('all');

  const criticalCount = filteredCVEs.filter((c) => c.severity === 'CRITICAL').length;
  const highCount = filteredCVEs.filter((c) => c.severity === 'HIGH').length;
  const overdueCount = filteredCVEs.filter((c) => c.isOverdue).length;
  const cisaKevCount = filteredCVEs.filter((c) => c.cisaKev).length;
  const verifiedCount = filteredCVEs.filter(
    (c) => c.workflowStatus === 'verified' || c.workflowStatus === 'closed'
  ).length;

  const displayedCVEs = useMemo(() => {
    return filteredCVEs.filter((c) => {
      if (selectedWorkflowFilter !== 'all' && c.workflowStatus !== selectedWorkflowFilter) {
        return false;
      }
      if (!localSearch) return true;
      const q = localSearch.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.officialDescription.toLowerCase().includes(q) ||
        c.remediationOwner.toLowerCase().includes(q) ||
        c.affectedComponents.some((comp) => comp.toLowerCase().includes(q))
      );
    });
  }, [filteredCVEs, localSearch, selectedWorkflowFilter]);

  const exportCVEAudit = () => {
    const headers = [
      'CVE ID',
      'Severity',
      'CVSS Score',
      'Title',
      'EPSS',
      'CISA KEV',
      'Workflow Status',
      'Target Date',
      'Overdue',
      'Fix Version',
      'Remediation Owner',
      'Affected Devices',
    ];
    const rows = displayedCVEs.map((c) => [
      `"${c.id}"`,
      `"${c.severity}"`,
      c.cvssScore,
      `"${c.title}"`,
      c.epssScore,
      c.cisaKev ? 'YES' : 'NO',
      `"${c.workflowStatus}"`,
      `"${c.targetRemediationDate}"`,
      c.isOverdue ? 'YES' : 'NO',
      `"${c.fixVersion}"`,
      `"${c.remediationOwner}"`,
      `"${c.affectedDeviceIds.join('; ')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zebra-cve-audit-report-${Date.now()}.csv`);
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
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            CVE Vulnerability & Security Operations Center
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              {filteredCVEs.length} Tracked Vulnerabilities
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized against CVE.org, NVD NIST, and internal Zebra Product Security Advisories (ZSB).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerDataSync('NVD NIST / CVE.org')}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync CVE Feeds</span>
          </button>

          <button
            type="button"
            onClick={exportCVEAudit}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Security KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-900 border border-rose-800/60 shadow-sm shadow-rose-950/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            Critical Severity (CVSS ≥ 9.0)
          </span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{criticalCount}</p>
          <span className="text-[10px] text-slate-500">Requires 30-day SLA remediation</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-amber-800/60 shadow-sm shadow-amber-950/20">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            High Severity (CVSS 7.0 - 8.9)
          </span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{highCount}</p>
          <span className="text-[10px] text-slate-500">Requires 60-day SLA remediation</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            CISA KEV Catalog Active
          </span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{cisaKevCount}</p>
          <span className="text-[10px] text-slate-500">Active weaponized exploit in wild</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            Overdue Remediations
          </span>
          <p
            className={`text-2xl font-bold font-mono mt-1 ${
              overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {overdueCount}
          </p>
          <span className="text-[10px] text-slate-500">Exceeded mandated SLA gate</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-emerald-800/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">
            Verified & Closed
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{verifiedCount}</p>
          <span className="text-[10px] text-slate-500">Validated in released firmware</span>
        </div>
      </div>

      {/* Filter and Workflow Stage Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search CVE ID (e.g. CVE-2026-21844), component, or owner..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Workflow Stage:</span>
          <select
            value={selectedWorkflowFilter}
            onChange={(e) => setSelectedWorkflowFilter(e.target.value)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 capitalize"
          >
            <option value="all">All Lifecycle Stages</option>
            <option value="identified">Identified</option>
            <option value="under_assessment">Under Assessment</option>
            <option value="confirmed_affected">Confirmed Affected</option>
            <option value="remediation_planned">Remediation Planned</option>
            <option value="fix_in_progress">Fix In Progress</option>
            <option value="released">Released</option>
            <option value="verified">Verified</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* CVE Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-3">CVE ID</th>
                <th className="p-3">Severity & Score</th>
                <th className="p-3">Title & Vulnerability Vector</th>
                <th className="p-3">Affected Zebra Hardware</th>
                <th className="p-3">Workflow State</th>
                <th className="p-3">Remediation SLA</th>
                <th className="p-3">Fix Target</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedCVEs.map((cve) => (
                <tr
                  key={cve.id}
                  onClick={() => setSelectedCVE(cve)}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="p-3">
                    <span className="font-mono font-bold text-rose-300 text-xs px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800">
                      {cve.id}
                    </span>
                    {cve.cisaKev && (
                      <span className="block text-[10px] font-bold text-rose-400 font-mono mt-1">
                        ● CISA KEV
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <SeverityBadge severity={cve.severity} score={cve.cvssScore} />
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      EPSS: {(cve.epssScore * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 max-w-sm">
                    <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors block">
                      {cve.title}
                    </span>
                    <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
                      Comp: {cve.affectedComponents.join(', ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {cve.affectedDeviceIds.map((dId) => (
                        <span
                          key={dId}
                          className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300"
                        >
                          {dId}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-950 border border-slate-700 text-cyan-300 capitalize">
                      {cve.workflowStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    <span
                      className={`font-bold ${
                        cve.isOverdue
                          ? 'text-rose-400'
                          : cve.slaDaysRemaining < 7
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {cve.isOverdue
                        ? `${Math.abs(cve.slaDaysRemaining)}d Overdue`
                        : `${cve.slaDaysRemaining}d remaining`}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      Target: {cve.targetRemediationDate}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-cyan-300 text-[11px]">
                    {cve.fixVersion}
                    <span className="block text-[10px] text-slate-500">{cve.remediationOwner.split(' ')[0]}</span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      Investigate
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
