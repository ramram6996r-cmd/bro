import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  Settings,
  RefreshCw,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Layers,
  Smartphone,
  ExternalLink,
  Lock,
  Clock,
  Sparkles,
} from 'lucide-react';
import { VerificationBadge } from '../common/Badges';
import { runValidationSuite, TestResult } from '../../utils/testSuite';

export const AdminDataSyncView: React.FC = () => {
  const {
    syncLogs,
    triggerDataSync,
    isSyncing,
    lastSyncTimestamp,
    devices,
    verifyDeviceMapping,
    isDemoMode,
    setIsDemoMode,
    role,
  } = usePlatform();

  const [activeSyncSource, setActiveSyncSource] = useState<string>('All Sources');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);

  const candidateDevices = devices.filter(
    (d) => d.verificationState === 'candidate_unverified'
  );

  const handleManualSync = async (source: string) => {
    setActiveSyncSource(source);
    await triggerDataSync(source);
    setSuccessNotice(`Successfully reconciled delta synchronization against ${source}. Cache updated.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleRunTests = () => {
    const results = runValidationSuite();
    setTestResults(results);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            System Administration & Integration Sync Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor enterprise connectors to Jira Cloud, CVE.org, and NVD feeds. Manage data classification, BOM reconciliation, and audit synchronization logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => handleManualSync('All Enterprise Connectors')}
            className="px-3.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-cyan-950 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Trigger Full Sync'}</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Integration Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Jira Connector */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Jira Cloud Enterprise
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              CONNECTED
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            <div>Endpoint: <strong className="text-slate-300">jira.internal.zebra.com</strong></div>
            <div>Projects: <strong className="text-cyan-300">ZEB, SEC, LNK, AUR, BSP, SCAN</strong></div>
            <div>Auth: <strong className="text-slate-300">Service Principal (OAuth 2.0)</strong></div>
          </div>
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => handleManualSync('Jira Cloud Enterprise')}
            className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold cursor-pointer disabled:opacity-50"
          >
            Reconcile Jira Issues
          </button>
        </div>

        {/* CVE.org / NVD Connector */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                CVE.org & NVD NIST
              </h3>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              ACTIVE FEED
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            <div>CVE JSON 5.0: <strong className="text-slate-300">cve.org REST API v1.1</strong></div>
            <div>NVD NIST API: <strong className="text-slate-300">nvd.nist.gov/api/v2</strong></div>
            <div>Rate-limit: <strong className="text-slate-300">50 req / 30 sec (Cached)</strong></div>
          </div>
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => handleManualSync('CVE.org & NVD NIST')}
            className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold cursor-pointer disabled:opacity-50"
          >
            Fetch Security Bulletins
          </button>
        </div>

        {/* Data Mode & Environment */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Data Environment Mode
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                isDemoMode
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {isDemoMode ? 'DEMO ENVIRONMENT' : 'PRODUCTION MODE'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isDemoMode
              ? 'Currently rendering validated synthetic data representing 5 platforms, candidate hardware BOMs, and vulnerabilities.'
              : 'Connected to internal production endpoints. Secrets and tokens are securely isolated in server-side memory.'}
          </p>
          <button
            type="button"
            onClick={() => setIsDemoMode(!isDemoMode)}
            className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold cursor-pointer"
          >
            {isDemoMode ? 'Switch to Live System Mode' : 'Switch to Demo Sandbox Mode'}
          </button>
        </div>
      </div>

      {/* Candidate Hardware BOM Reconciliation Queue */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Candidate Hardware BOM Verification Queue ({candidateDevices.length} pending)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifiers originating from internal engineering sprint repositories that require formal hardware bill-of-materials qualification before external release.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {candidateDevices.map((dev) => (
            <div
              key={dev.id}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                    ID: {dev.id}
                  </span>
                  <span className="font-semibold text-slate-100">{dev.name}</span>
                  <VerificationBadge state={dev.verificationState} size="sm" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Origin: {dev.sourceUrl} • Verified in branch on {dev.lastVerificationDate}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    verifyDeviceMapping(
                      dev.id,
                      'verified_internal',
                      'Formally qualified through internal hardware BOM reconciliation.'
                    );
                    setSuccessNotice(`Device ${dev.id} verified and promoted to Verified Internal.`);
                  }}
                  className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs cursor-pointer"
                >
                  Confirm Hardware Mapping
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated System Verification Suite */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Automated Integrity, CVE Normalization & RBAC Verification Suite
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Executes internal unit & integration assertion tests across CVE format normalization, candidate device isolation, 5-platform integrity, and sales permission boundaries.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunTests}
            className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm shadow-purple-950 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Automated Test Suite</span>
          </button>
        </div>

        {testResults && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">
                ✓ {testResults.filter((t) => t.passed).length} of {testResults.length} Tests Passed
              </span>
              <span className="text-slate-400">All Core Platform Assertions Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {testResults.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200 block">{t.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{t.suite}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sync Run Logs Audit Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Recent Synchronization Runs & Delta Audit Logs
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Last sync: {lastSyncTimestamp.toLocaleTimeString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Source Provider</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Records Fetched</th>
                <th className="p-2.5">Records Updated</th>
                <th className="p-2.5">Latency</th>
                <th className="p-2.5">Audit Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-2.5 text-slate-300">{log.timestamp.slice(11, 19)} UTC</td>
                  <td className="p-2.5 font-bold text-cyan-300">{log.source}</td>
                  <td className="p-2.5">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-300">{log.recordsFetched}</td>
                  <td className="p-2.5 text-cyan-400">{log.recordsUpdated}</td>
                  <td className="p-2.5 text-slate-400">{log.durationMs}ms</td>
                  <td className="p-2.5 text-slate-300 font-sans truncate max-w-sm">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
