import React from 'react';
import { VerificationState, CVESeverity, ReleaseStatus, JiraStatus } from '../../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';

export const VerificationBadge: React.FC<{ state: VerificationState; size?: 'sm' | 'md' }> = ({
  state,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const padding = isSm ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (state) {
    case 'verified_external':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 ${padding}`}
          title="Verified via official Zebra public documentation and specifications"
        >
          <ShieldCheck className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Verified Public
        </span>
      );
    case 'verified_internal':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 ${padding}`}
          title="Verified through internal Zebra engineering repositories and Jira BSP records"
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Verified Internal
        </span>
      );
    case 'candidate_unverified':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded bg-amber-950/80 text-amber-300 border border-amber-600/70 animate-pulse ${padding}`}
          title="Candidate identifier - Requires internal verification before external dissemination"
        >
          <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Requires Verification
        </span>
      );
    case 'internally_assessed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 ${padding}`}
          title="Assessed by internal security or architecture team"
        >
          <ShieldAlert className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Assessed
        </span>
      );
    case 'not_affected':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded bg-slate-900 text-slate-300 border border-slate-700 ${padding}`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Not Affected
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded bg-slate-900 text-slate-400 border border-slate-700 ${padding}`}
        >
          <HelpCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Unconfirmed
        </span>
      );
  }
};

export const SeverityBadge: React.FC<{ severity: CVESeverity; score?: number }> = ({
  severity,
  score,
}) => {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-600/80 shadow-xs shadow-rose-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          CRITICAL {score ? `(${score})` : ''}
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/70">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          HIGH {score ? `(${score})` : ''}
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-950/70 text-blue-300 border border-blue-700/50">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          MEDIUM {score ? `(${score})` : ''}
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-slate-400 border border-slate-700">
          LOW {score ? `(${score})` : ''}
        </span>
      );
  }
};

export const ReleaseStatusBadge: React.FC<{ status: ReleaseStatus }> = ({ status }) => {
  switch (status) {
    case 'released':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Released
        </span>
      );
    case 'on_track':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
          <Clock className="w-3 h-3 text-cyan-400" />
          On Track
        </span>
      );
    case 'at_risk':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-500/80">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          At Risk
        </span>
      );
    case 'delayed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-600/80">
          <XCircle className="w-3 h-3 text-rose-400" />
          Delayed
        </span>
      );
    case 'planned':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700">
          <Clock className="w-3 h-3 text-slate-400" />
          Planned
        </span>
      );
  }
};

export const JiraStatusBadge: React.FC<{ status: JiraStatus }> = ({ status }) => {
  switch (status) {
    case 'Resolved':
    case 'Closed':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800">
          {status}
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-950/70 text-cyan-300 border border-cyan-800">
          In Progress
        </span>
      );
    case 'In Review':
    case 'Verification Pending':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-950/70 text-purple-300 border border-purple-800">
          {status}
        </span>
      );
    case 'Blocked':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-700">
          Blocked
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
          Open
        </span>
      );
  }
};
