import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  X,
  ShieldAlert,
  Clock,
  ExternalLink,
  GitPullRequest,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRight,
  User,
} from 'lucide-react';
import { SeverityBadge, VerificationBadge } from '../common/Badges';
import { CVEWorkflowStatus } from '../../types';

export const CVEDetailModal: React.FC = () => {
  const {
    selectedCVE,
    setSelectedCVE,
    updateCVEWorkflow,
    canViewRestrictedExploits,
    canEditWorkflows,
    setSelectedJiraIssue,
    setSelectedDevice,
    devices,
    jiraIssues,
    role,
  } = usePlatform();

  const [workflowNote, setWorkflowNote] = useState('');
  const [selectedNextStatus, setSelectedNextStatus] = useState<CVEWorkflowStatus | ''>('');

  if (!selectedCVE) return null;

  const relevantJira = jiraIssues.filter((j) =>
    selectedCVE.relatedJiraKeys.includes(j.key)
  );
  const affectedDevices = devices.filter((d) =>
    selectedCVE.affectedDeviceIds.includes(d.id)
  );

  const workflowStages: { id: CVEWorkflowStatus; label: string }[] = [
    { id: 'identified', label: '1. Identified' },
    { id: 'under_assessment', label: '2. Under Assessment' },
    { id: 'confirmed_affected', label: '3. Confirmed Affected' },
    { id: 'remediation_planned', label: '4. Remediation Planned' },
    { id: 'fix_in_progress', label: '5. Fix In Progress' },
    { id: 'fix_implemented', label: '6. Fix Implemented' },
    { id: 'released', label: '7. Released' },
    { id: 'verified', label: '8. Verified' },
    { id: 'closed', label: '9. Closed' },
    { id: 'not_affected', label: 'Not Affected' },
    { id: 'risk_accepted', label: 'Risk Accepted' },
    { id: 'false_positive', label: 'False Positive' },
    { id: 'awaiting_vendor_fix', label: 'Awaiting Vendor Fix' },
  ];

  const handleStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNextStatus) return;
    updateCVEWorkflow(selectedCVE.id, selectedNextStatus as CVEWorkflowStatus, workflowNote);
    setWorkflowNote('');
    setSelectedNextStatus('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="font-mono text-rose-300 font-extrabold text-lg px-2.5 py-0.5 rounded bg-rose-950/80 border border-rose-800">
              {selectedCVE.id}
            </span>
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-100 flex items-center gap-2">
                {selectedCVE.title}
              </h2>
              <span className="text-xs text-slate-400">
                Published: {selectedCVE.publishedDate} • Source: {selectedCVE.sourceDatabase}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={selectedCVE.severity} score={selectedCVE.cvssScore} />
            <button
              type="button"
              onClick={() => setSelectedCVE(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Threat metrics banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                CVSS Base Score
              </span>
              <p className="text-xl font-bold font-mono text-rose-400">
                {selectedCVE.cvssScore}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  (v{selectedCVE.cvssVersion})
                </span>
              </p>
              <span className="text-[10px] text-slate-500">Official National Vulnerability DB</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                EPSS Exploit Prob.
              </span>
              <p className="text-xl font-bold font-mono text-amber-400">
                {(selectedCVE.epssScore * 100).toFixed(1)}%
              </p>
              <span className="text-[10px] text-slate-500">High probability of in-the-wild attack</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                CISA KEV Catalog
              </span>
              <p className="text-xl font-bold font-mono">
                {selectedCVE.cisaKev ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> ACTIVE KEV
                  </span>
                ) : (
                  <span className="text-slate-400">Not in KEV</span>
                )}
              </p>
              <span className="text-[10px] text-slate-500">U.S. CISA Federal Directive</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Remediation SLA
              </span>
              <p
                className={`text-xl font-bold font-mono ${
                  selectedCVE.isOverdue
                    ? 'text-rose-400'
                    : selectedCVE.slaDaysRemaining < 7
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {selectedCVE.isOverdue
                  ? `${Math.abs(selectedCVE.slaDaysRemaining)}d Overdue`
                  : `${selectedCVE.slaDaysRemaining}d Left`}
              </p>
              <span className="text-[10px] text-slate-500">
                Target: {selectedCVE.targetRemediationDate}
              </span>
            </div>
          </div>

          {/* Official Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Official Description & Technical Root Cause
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
              {selectedCVE.officialDescription}
            </div>
          </div>

          {/* Internal Impact Assessment & Remediation Strategy */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Internal Impact Assessment (Zebra Products)
            </h4>
            <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60 text-xs text-slate-200 leading-relaxed space-y-2">
              <p>{selectedCVE.internalImpactAssessment}</p>
              <div className="pt-2 border-t border-cyan-900/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-cyan-300">
                <span>Remediation Owner: <strong>{selectedCVE.remediationOwner}</strong></span>
                <span>Fix Target Version: <strong>{selectedCVE.fixVersion}</strong></span>
                <span>Verification State: <strong>{selectedCVE.verificationStatus}</strong></span>
              </div>
            </div>
          </div>

          {/* Restricted Exploit Intelligence (Restricted to Security / Eng Leads) */}
          {canViewRestrictedExploits ? (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wide">
                <Lock className="w-3.5 h-3.5" />
                Confidential Exploit & Weaponization Notes (Role Restricted)
              </div>
              <p className="text-slate-300 text-[11px] font-mono leading-relaxed">
                {selectedCVE.confidentialExploitNotes || 'No zero-day weaponization telemetry reported.'}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span>Restricted technical exploit details hidden for role {role}.</span>
            </div>
          )}

          {/* Affected Platforms, Devices, and Version Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Affected Zebra Devices ({affectedDevices.length})
              </h5>
              <div className="space-y-1.5">
                {affectedDevices.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDevice(d)}
                    className="p-1.5 rounded hover:bg-slate-800 cursor-pointer flex items-center justify-between text-slate-200 border border-slate-800/60"
                  >
                    <span className="font-mono text-cyan-300 font-bold">{d.id}</span>
                    <span className="text-[11px] text-slate-400">{d.name}</span>
                    <VerificationBadge state={d.verificationState} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
                Linked Internal Jira Issues ({relevantJira.length})
              </h5>
              <div className="space-y-1.5">
                {relevantJira.map((j) => (
                  <div
                    key={j.key}
                    onClick={() => setSelectedJiraIssue(j)}
                    className="p-1.5 rounded hover:bg-slate-800 cursor-pointer flex items-center justify-between text-slate-200 border border-slate-800/60"
                  >
                    <div className="truncate max-w-[200px]">
                      <span className="font-mono text-emerald-400 font-bold block">{j.key}</span>
                      <span className="text-[10px] text-slate-400 truncate">{j.summary}</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400">{j.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Stage Transition (For authorized roles) */}
          {canEditWorkflows && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Remediation Lifecycle Workflow
                </h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 capitalize">
                  Current: {selectedCVE.workflowStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <form onSubmit={handleStatusChange} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Transition to Stage
                    </label>
                    <select
                      value={selectedNextStatus}
                      onChange={(e) => setSelectedNextStatus(e.target.value as CVEWorkflowStatus)}
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select Target Workflow Stage...</option>
                      {workflowStages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Audit Note / Evidence
                    </label>
                    <input
                      type="text"
                      value={workflowNote}
                      onChange={(e) => setWorkflowNote(e.target.value)}
                      placeholder="e.g. Code reviewed, patch merged in LifeGuard build #241"
                      className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!selectedNextStatus}
                    className="px-3.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Commit Workflow Transition
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reference links */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800 pt-3">
            <a
              href={selectedCVE.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              Authoritative Reference ({selectedCVE.sourceDatabase})
              <ExternalLink className="w-3 h-3" />
            </a>
            {selectedCVE.vendorAdvisoryUrl && (
              <a
                href={selectedCVE.vendorAdvisoryUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Vendor Advisory Bulletin
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedCVE(null)}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
