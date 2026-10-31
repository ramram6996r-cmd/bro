import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  X,
  ExternalLink,
  ShieldAlert,
  GitPullRequest,
  Calendar,
  Layers,
  Cpu,
  Radio,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { VerificationBadge, SeverityBadge } from '../common/Badges';
import { VerificationState } from '../../types';

export const DeviceDetailModal: React.FC = () => {
  const {
    selectedDevice,
    setSelectedDevice,
    platforms,
    cves,
    jiraIssues,
    setSelectedCVE,
    setSelectedJiraIssue,
    verifyDeviceMapping,
    role,
  } = usePlatform();

  if (!selectedDevice) return null;

  const platform = platforms.find((p) => p.id === selectedDevice.platformId);
  const relevantCVEs = cves.filter((c) =>
    c.affectedDeviceIds.includes(selectedDevice.id)
  );
  const relevantJira = jiraIssues.filter((j) =>
    j.deviceIds.includes(selectedDevice.id)
  );

  const canVerify = role === 'administrator' || role === 'engineering_lead';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="font-mono text-cyan-300 font-extrabold text-lg px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              {selectedDevice.id}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {selectedDevice.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Model: {selectedDevice.modelNumber} • {selectedDevice.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <VerificationBadge state={selectedDevice.verificationState} />
            <button
              type="button"
              onClick={() => setSelectedDevice(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Candidate Verification Warning if unverified */}
          {selectedDevice.verificationState === 'candidate_unverified' && (
            <div className="p-3.5 rounded-lg bg-amber-950/70 border border-amber-600/80 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Internal Engineering Candidate Identifier</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {selectedDevice.verificationNotes}
              </p>
              {canVerify && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-200">
                    Administrative Action:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      verifyDeviceMapping(
                        selectedDevice.id,
                        'verified_internal',
                        'Validated via internal BSP engineering schematics.'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-[11px] font-semibold cursor-pointer"
                  >
                    Confirm Internal Mapping
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick specs grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Platform Architecture
              </span>
              <p className="text-xs font-semibold text-cyan-300">
                {platform ? platform.name : `Platform ${selectedDevice.platformNumericId}`}
              </p>
              <p className="text-[11px] text-slate-400">{platform?.codeName}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Hardware Gen & Board
              </span>
              <p className="text-xs font-semibold text-slate-200">
                {selectedDevice.hardwareGeneration}
              </p>
              <p className="text-[11px] text-slate-400">
                Status: <strong className="text-emerald-400">{selectedDevice.lifecycleStatus}</strong>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Latest Verified Release
              </span>
              <p className="text-xs font-mono font-bold text-purple-300">
                {selectedDevice.latestVerifiedRelease}
              </p>
              <p className="text-[11px] text-slate-400">
                Verified: {selectedDevice.lastVerificationDate}
              </p>
            </div>
          </div>

          {/* Device Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Product Overview & Intended Domain
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
              {selectedDevice.description}
            </p>
          </div>

          {/* Supported Software, OS, and Firmware */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
              <h5 className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Supported OS
              </h5>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {selectedDevice.supportedOS.map((os) => (
                  <li key={os} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{os}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
              <h5 className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                Supported Firmware
              </h5>
              <ul className="space-y-1 text-slate-300 text-[11px] font-mono">
                {selectedDevice.supportedFirmware.map((fw) => (
                  <li key={fw} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>{fw}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
              <h5 className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Supported Software & Suites
              </h5>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {selectedDevice.supportedSoftware.map((sw) => (
                  <li key={sw} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{sw}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hardware Components and Modules */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Key Components & Silicon
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedDevice.components.map((comp) => (
                <span
                  key={comp}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Associated CVE Security Vulnerabilities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Associated CVE Vulnerabilities ({relevantCVEs.length})
              </h4>
            </div>
            {relevantCVEs.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-950 p-3 rounded border border-slate-800">
                No open CVE vulnerabilities currently mapped to this device.
              </p>
            ) : (
              <div className="space-y-2">
                {relevantCVEs.map((cve) => (
                  <div
                    key={cve.id}
                    onClick={() => setSelectedCVE(cve)}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-600 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-300 text-xs">
                          {cve.id}
                        </span>
                        <SeverityBadge severity={cve.severity} score={cve.cvssScore} />
                        <span className="text-xs text-slate-200 font-medium">
                          {cve.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {cve.internalImpactAssessment}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-cyan-400 font-mono block">
                        Fix: {cve.fixVersion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Jira Issues & Regressions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-emerald-400" />
              Associated Jira Engineering Issues ({relevantJira.length})
            </h4>
            {relevantJira.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-950 p-3 rounded border border-slate-800">
                No open Jira issues assigned to this device.
              </p>
            ) : (
              <div className="space-y-2">
                {relevantJira.map((issue) => (
                  <div
                    key={issue.key}
                    onClick={() => setSelectedJiraIssue(issue)}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-600 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-300 text-xs">
                          {issue.key}
                        </span>
                        <span className="text-xs text-slate-200 font-medium">
                          {issue.summary}
                        </span>
                        {issue.isBlocker && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                            BLOCKER
                          </span>
                        )}
                        {issue.isCarryOver && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                            CARRY-OVER
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Assignee: {issue.assignee} • Fix Version: {issue.fixVersion}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 shrink-0">
                      {issue.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Provenance & Official Source Links */}
          <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">
              Official Data Provenance & Verification
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Source URL: <strong className="text-slate-200">{selectedDevice.sourceUrl}</strong></span>
              <span>Last Verified: <strong className="text-slate-200">{selectedDevice.lastVerificationDate}</strong></span>
            </div>
            <div className="flex gap-4 pt-1">
              <a
                href={selectedDevice.officialDocUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                Official Zebra Documentation
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={selectedDevice.supportUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                Zebra Support & Downloads
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedDevice(null)}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
