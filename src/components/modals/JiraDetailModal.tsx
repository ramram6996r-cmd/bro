import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  X,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Layers,
  Smartphone,
  ShieldAlert,
  Clock,
  Tag,
} from 'lucide-react';
import { JiraStatusBadge } from '../common/Badges';
import { JiraStatus } from '../../types';

export const JiraDetailModal: React.FC = () => {
  const {
    selectedJiraIssue,
    setSelectedJiraIssue,
    updateJiraStatus,
    setSelectedCVE,
    setSelectedDevice,
    cves,
    devices,
    canViewInternalTechNotes,
  } = usePlatform();

  const [newStatus, setNewStatus] = useState<JiraStatus | ''>('');

  if (!selectedJiraIssue) return null;

  const linkedCVEItems = cves.filter((c) =>
    selectedJiraIssue.linkedCVEs.includes(c.id)
  );
  const mappedDevices = devices.filter((d) =>
    selectedJiraIssue.deviceIds.includes(d.id)
  );

  const statuses: JiraStatus[] = [
    'Open',
    'In Progress',
    'In Review',
    'Verification Pending',
    'Resolved',
    'Closed',
    'Blocked',
  ];

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus) return;
    updateJiraStatus(selectedJiraIssue.key, newStatus as JiraStatus);
    setNewStatus('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-300 font-extrabold text-base px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
              {selectedJiraIssue.key}
            </span>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-100">
                {selectedJiraIssue.summary}
              </h2>
              <span className="text-xs text-slate-400">
                Type: {selectedJiraIssue.issueType} • Priority: {selectedJiraIssue.priority}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <JiraStatusBadge status={selectedJiraIssue.status} />
            <button
              type="button"
              onClick={() => setSelectedJiraIssue(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Badges for blocker and carryover */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedJiraIssue.isBlocker && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                CRITICAL RELEASE BLOCKER
              </span>
            )}
            {selectedJiraIssue.isCarryOver && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                CARRIED OVER FROM {selectedJiraIssue.carriedOverFrom}
              </span>
            )}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
              Component: {selectedJiraIssue.component}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
              Fix Version: {selectedJiraIssue.fixVersion}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Assignee</span>
              <p className="font-semibold text-slate-200 mt-0.5">{selectedJiraIssue.assignee}</p>
              <span className="text-[10px] text-slate-500">{selectedJiraIssue.team}</span>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Created Date</span>
              <p className="font-mono text-slate-200 mt-0.5">{selectedJiraIssue.createdDate}</p>
              <span className="text-[10px] text-slate-500">Updated: {selectedJiraIssue.updatedDate}</span>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Affected Versions</span>
              <p className="font-mono text-slate-200 mt-0.5">
                {selectedJiraIssue.affectedVersions.join(', ')}
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Resolved Date</span>
              <p className="font-mono text-emerald-400 mt-0.5">
                {selectedJiraIssue.resolvedDate || 'Not yet resolved'}
              </p>
            </div>
          </div>

          {/* Customer Facing Notes */}
          {selectedJiraIssue.customerFacingDescription && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Approved Customer Release Description
              </h4>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                {selectedJiraIssue.customerFacingDescription}
              </div>
            </div>
          )}

          {/* Internal Technical Details (Role-Restricted) */}
          {canViewInternalTechNotes && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Internal Engineering Root Cause & Fix Details
              </h4>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                {selectedJiraIssue.internalTechnicalDetails}
              </div>
            </div>
          )}

          {/* Linked CVEs */}
          {linkedCVEItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Linked Vulnerabilities ({linkedCVEItems.length})
              </h4>
              <div className="space-y-1.5">
                {linkedCVEItems.map((cve) => (
                  <div
                    key={cve.id}
                    onClick={() => setSelectedCVE(cve)}
                    className="p-2 rounded bg-slate-950 border border-slate-800 hover:border-rose-500 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-rose-400 font-bold">{cve.id}</span>
                    <span className="text-slate-300 truncate max-w-md">{cve.title}</span>
                    <span className="font-mono text-slate-400">{cve.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target Devices */}
          {mappedDevices.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                Target Devices ({mappedDevices.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {mappedDevices.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDevice(d)}
                    className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-cyan-500 cursor-pointer text-xs font-mono text-cyan-300"
                  >
                    {d.id} ({d.name})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Jira Status Switcher */}
          <form onSubmit={handleUpdate} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              Update Jira Issue Workflow Status
            </span>
            <div className="flex items-center gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as JiraStatus)}
                className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select New Status...</option>
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!newStatus}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white cursor-pointer"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedJiraIssue(null)}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
