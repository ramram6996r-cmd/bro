import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  FileBarChart,
  FileDown,
  Printer,
  Calendar,
  Layers,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const ReportsAnalyticsView: React.FC = () => {
  const {
    filteredPlatforms,
    filteredDevices,
    filteredReleases,
    filteredCVEs,
    filteredJiraIssues,
    role,
    lastSyncTimestamp,
    filters,
  } = usePlatform();

  const [activeReportType, setActiveReportType] = useState<
    'monthly_summary' | 'cve_remediation' | 'carry_over' | 'platform_health'
  >('monthly_summary');

  const now = new Date();

  // Export JSON
  const handleExportJSON = () => {
    const reportData = {
      reportType: activeReportType,
      generatedAt: now.toISOString(),
      generatedByRole: role,
      dataFreshness: lastSyncTimestamp.toISOString(),
      activeFilters: filters,
      summary: {
        platformsCount: filteredPlatforms.length,
        devicesCount: filteredDevices.length,
        releasesCount: filteredReleases.length,
        cvesCount: filteredCVEs.length,
        jiraIssuesCount: filteredJiraIssues.length,
      },
      platforms: filteredPlatforms,
      releases: filteredReleases,
      cves: filteredCVEs,
      jiraIssues: filteredJiraIssues,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `zebra-report-${activeReportType}-${Date.now()}.json`);
    dlAnchorElem.click();
  };

  // Export CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeReportType === 'cve_remediation') {
      headers = ['CVE ID', 'Severity', 'CVSS', 'Workflow Stage', 'Target Date', 'Overdue', 'Remediation Owner', 'Devices'];
      rows = filteredCVEs.map((c) => [
        `"${c.id}"`,
        `"${c.severity}"`,
        `"${c.cvssScore}"`,
        `"${c.workflowStatus}"`,
        `"${c.targetRemediationDate}"`,
        c.isOverdue ? 'YES' : 'NO',
        `"${c.remediationOwner}"`,
        `"${c.affectedDeviceIds.join('; ')}"`,
      ]);
    } else {
      headers = ['Release ID', 'Platform', 'Version', 'Cadence Month', 'Status', 'Readiness %', 'Bugs', 'CVEs Fixed', 'Carry-Overs'];
      rows = filteredReleases.map((r) => [
        `"${r.id}"`,
        `"Platform ${r.platformNumericId}"`,
        `"${r.version}"`,
        `"${r.releaseMonth}"`,
        `"${r.status}"`,
        `"${r.readinessPercentage}"`,
        `"${r.bugFixesCount}"`,
        `"${r.securityFixesCount}"`,
        `"${r.carriedOverIssuesCount}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zebra-report-${activeReportType}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-cyan-400" />
            Compliance, Release & Executive Reporting Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Stakeholder-scoped reports with certified data timestamps, applied filter auditing, and metric derivations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-cyan-950 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-white" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'monthly_summary', label: 'Monthly Release Executive Summary' },
          { id: 'cve_remediation', label: 'CVE Remediation & SLA Audit' },
          { id: 'carry_over', label: 'Carry-Over Technical Debt Analysis' },
          { id: 'platform_health', label: 'Five-Platform Health & Predictability' },
        ].map((rep) => {
          const isSelected = activeReportType === rep.id;
          return (
            <button
              key={rep.id}
              type="button"
              onClick={() => setActiveReportType(rep.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-950 border-cyan-500/80 text-cyan-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {rep.label}
            </button>
          );
        })}
      </div>

      {/* Report Metadata Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
          <Info className="w-3.5 h-3.5" />
          Certified Report Audit Metadata
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-400 text-[11px] font-mono">
          <div>Generated At: <strong className="text-slate-200 block">{now.toLocaleDateString()} {now.toLocaleTimeString()}</strong></div>
          <div>Auditing Role: <strong className="text-cyan-300 block uppercase">{role}</strong></div>
          <div>Data Freshness: <strong className="text-emerald-400 block">{lastSyncTimestamp.toLocaleTimeString()}</strong></div>
          <div>Caveats: <strong className="text-slate-200 block">Restricted to authorized scope</strong></div>
        </div>
      </div>

      {/* Render Selected Report View */}
      {activeReportType === 'monthly_summary' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Monthly Release Executive Summary (Q4 2026)
          </h3>
          <p className="text-xs text-slate-400">
            Consolidated release tracking across active software versions, customer release bulletins, and milestone completion rates.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Target Release</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Target Date</th>
                  <th className="p-3">Readiness</th>
                  <th className="p-3">Scope (Bugs / Sec)</th>
                  <th className="p-3">Carry-Over</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredReleases.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-cyan-300">Platform {r.platformNumericId}</td>
                    <td className="p-3 font-bold text-purple-300">{r.version}</td>
                    <td className="p-3 capitalize">{r.status.replace('_', ' ')}</td>
                    <td className="p-3 text-slate-300">{r.plannedReleaseDate}</td>
                    <td className="p-3 text-emerald-400 font-bold">{r.readinessPercentage}%</td>
                    <td className="p-3 text-slate-300">{r.bugFixesCount} bugs / {r.securityFixesCount} CVEs</td>
                    <td className="p-3 text-amber-400">{r.carriedOverIssuesCount} issues</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportType === 'cve_remediation' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            CVE Vulnerability SLA Compliance Audit
          </h3>
          <p className="text-xs text-slate-400">
            Mandated 30-day (Critical) and 60-day (High) SLA audit against CVSS v3.1 vulnerabilities affecting Zebra devices.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">CVE ID</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">CVSS</th>
                  <th className="p-3">Workflow State</th>
                  <th className="p-3">Target Date</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3">Remediation Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredCVEs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-rose-300">{c.id}</td>
                    <td className="p-3 font-semibold">{c.severity}</td>
                    <td className="p-3 font-bold">{c.cvssScore}</td>
                    <td className="p-3 capitalize text-cyan-300">{c.workflowStatus.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-slate-300">{c.targetRemediationDate}</td>
                    <td className="p-3 font-bold">
                      {c.isOverdue ? (
                        <span className="text-rose-400">{Math.abs(c.slaDaysRemaining)}d Overdue</span>
                      ) : (
                        <span className="text-emerald-400">{c.slaDaysRemaining}d Left</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">{c.remediationOwner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportType === 'carry_over' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Carry-Over Technical Debt Analysis
          </h3>
          <p className="text-xs text-slate-400">
            Jira defects and security patches carried over from prior monthly release milestones.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Issue Key</th>
                  <th className="p-3">Summary</th>
                  <th className="p-3">Carried Over From</th>
                  <th className="p-3">Target Fix Version</th>
                  <th className="p-3">Assignee</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredJiraIssues
                  .filter((j) => j.isCarryOver)
                  .map((j) => (
                    <tr key={j.key} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-amber-300">{j.key}</td>
                      <td className="p-3 font-sans text-slate-200">{j.summary}</td>
                      <td className="p-3 text-slate-400">{j.carriedOverFrom}</td>
                      <td className="p-3 text-cyan-300">{j.fixVersion}</td>
                      <td className="p-3 text-slate-300 font-sans">{j.assignee}</td>
                      <td className="p-3 text-emerald-400">{j.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportType === 'platform_health' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Five-Platform Predictability & Cadence Health Scorecard
          </h3>
          <p className="text-xs text-slate-400">
            Cross-platform health comparison across Mapped Devices, Open Blockers, Critical CVE Exposure, and Quality Gate Readiness.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Platform Name</th>
                  <th className="p-3">Architecture</th>
                  <th className="p-3 text-center">Devices</th>
                  <th className="p-3 text-center">Blockers</th>
                  <th className="p-3 text-center">Critical CVEs</th>
                  <th className="p-3 text-center">Readiness</th>
                  <th className="p-3">Cadence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPlatforms.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-100">{p.name}</td>
                    <td className="p-3 font-mono text-cyan-300 text-[11px]">{p.codeName}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-300">{p.mappedDeviceCount}</td>
                    <td className="p-3 text-center font-mono font-bold text-rose-400">{p.openBlockers}</td>
                    <td className="p-3 text-center font-mono font-bold text-rose-400">{p.openCriticalCVEs}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-400">{p.releaseReadinessScore}%</td>
                    <td className="p-3 text-slate-400 text-[11px]">{p.releaseCadence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
