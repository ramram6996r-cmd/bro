import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { MetricCard } from '../common/MetricCard';
import {
  Layers,
  Smartphone,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  GitPullRequest,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ExecutiveOverviewView: React.FC = () => {
  const {
    filteredPlatforms,
    filteredDevices,
    filteredReleases,
    filteredCVEs,
    filteredJiraIssues,
    filteredAlerts,
    role,
    setActiveTab,
    updateFilter,
    setSelectedCVE,
    setSelectedRelease,
  } = usePlatform();

  // Calculations for KPIs
  const totalPlatforms = filteredPlatforms.length;
  const totalDevices = filteredDevices.length;
  const activeProducts = filteredDevices.filter(
    (d) => d.lifecycleStatus === 'Active / GA' || d.lifecycleStatus === 'Mature'
  ).length;

  const releasesPlanned = filteredReleases.filter(
    (r) => r.status === 'planned' || r.status === 'on_track'
  ).length;
  const releasesCompleted = filteredReleases.filter((r) => r.status === 'released').length;
  const releasesAtRisk = filteredReleases.filter(
    (r) => r.status === 'at_risk' || r.status === 'delayed'
  ).length;

  const avgReadiness =
    filteredReleases.length > 0
      ? Math.round(
          filteredReleases.reduce((acc, r) => acc + r.readinessPercentage, 0) /
            filteredReleases.length
        )
      : 0;

  const openCriticalCVEs = filteredCVEs.filter(
    (c) => c.severity === 'CRITICAL' && c.workflowStatus !== 'closed'
  ).length;

  const overdueCVEs = filteredCVEs.filter((c) => c.isOverdue).length;

  const fixesDelivered = filteredReleases
    .filter((r) => r.status === 'released')
    .reduce((acc, r) => acc + r.bugFixesCount + r.securityFixesCount, 0);

  // Chart Data: Health by Platform
  const platformHealthData = filteredPlatforms.map((p) => {
    const pReleases = filteredReleases.filter((r) => r.platformId === p.id);
    const onTrack = pReleases.filter((r) => r.status === 'on_track' || r.status === 'released').length;
    const atRisk = pReleases.filter((r) => r.status === 'at_risk').length;
    const delayed = pReleases.filter((r) => r.status === 'delayed').length;
    return {
      name: `P${p.numericId}`,
      fullName: p.name.split(':')[0],
      onTrack,
      atRisk,
      delayed,
      readiness: p.releaseReadinessScore,
    };
  });

  // Chart Data: Monthly Releases
  const monthlyData = [
    { month: 'Aug 2026', planned: 5, completed: 5, carriedOver: 2 },
    { month: 'Sep 2026', planned: 5, completed: 5, carriedOver: 3 },
    { month: 'Oct 2026', planned: 5, completed: 4, carriedOver: 4 },
    { month: 'Nov 2026', planned: 4, completed: 1, carriedOver: 6 },
    { month: 'Dec 2026', planned: 3, completed: 0, carriedOver: 3 },
  ];

  // CVE Severity Breakdown
  const cveBreakdown = [
    { name: 'Critical', value: filteredCVEs.filter((c) => c.severity === 'CRITICAL').length, color: '#f43f5e' },
    { name: 'High', value: filteredCVEs.filter((c) => c.severity === 'HIGH').length, color: '#f59e0b' },
    { name: 'Medium', value: filteredCVEs.filter((c) => c.severity === 'MEDIUM').length, color: '#3b82f6' },
    { name: 'Low', value: filteredCVEs.filter((c) => c.severity === 'LOW').length, color: '#64748b' },
  ].filter((item) => item.value > 0);

  // Fixes Completed vs Carried Over
  const carryOverData = [
    { name: 'Sep 2026', completedFixes: 29, carriedOver: 5 },
    { name: 'Oct 2026', completedFixes: 34, carriedOver: 6 },
    { name: 'Nov 2026 (Fcst)', completedFixes: 26, carriedOver: 9 },
  ];

  // Action Items requiring immediate executive escalation
  const criticalActions = [
    {
      id: 'act-1',
      title: 'Platform 1 October GA Release Delayed (v2026.10.2-MR)',
      details: 'Vendor Qualcomm signed binary for CVE-2026-21844 pending regression gate. Impacts TC58, TC78, and Device 4490.',
      owner: 'Marcus Vance',
      action: () => {
        const r = filteredReleases.find((rel) => rel.id === 'rel-p1-2026-10');
        if (r) setSelectedRelease(r);
      },
      severity: 'critical',
    },
    {
      id: 'act-2',
      title: 'CVE-2026-38290 Pre-Auth Command Injection Overdue',
      details: 'Overdue by 3 days past 30-day Critical SLA. PR #188 under security verification for Aurora FS40 & Sensor 5841.',
      owner: 'Christopher Vance',
      action: () => {
        const c = filteredCVEs.find((item) => item.id === 'CVE-2026-38290');
        if (c) setSelectedCVE(c);
      },
      severity: 'critical',
    },
    {
      id: 'act-3',
      title: 'Unverified Candidate Device Identifiers (4490, 33605, 5841)',
      details: 'Identified in Jira engineering logs; requires hardware BOM confirmation before customer release note generation.',
      owner: 'Release Operations',
      action: () => {
        updateFilter('deviceIds', ['4490', '33605', '5841']);
        setActiveTab('products');
      },
      severity: 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800">
        <div>
          <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
            Executive Release Intelligence Dashboard
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Q4 2026 Cycle
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status across 5 Zebra software platforms, active commercial devices, Jira remediation epics, and CVSS vulnerability vectors.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Export Executive Briefing</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* 10 Enterprise KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard
          title="Total Platforms"
          value={totalPlatforms}
          subtitle="Core Architecture"
          calculation="COUNT(platforms) where platform.id IN (1..5)"
          reportingPeriod="Current Active"
          dataSource="Zebra Platform Registry"
          icon={<Layers className="w-4 h-4" />}
          onDrilldown={() => setActiveTab('platforms')}
        />

        <MetricCard
          title="Mapped Devices"
          value={totalDevices}
          subtitle="Catalog Index"
          calculation="COUNT(devices) matching active filters"
          reportingPeriod="Current Active"
          dataSource="Hardware BOM & Jira"
          icon={<Smartphone className="w-4 h-4" />}
          onDrilldown={() => setActiveTab('products')}
        />

        <MetricCard
          title="Active Products"
          value={activeProducts}
          subtitle="GA & Mature"
          calculation="COUNT(devices) where status IN ('Active / GA', 'Mature')"
          reportingPeriod="Current Active"
          dataSource="TechDocs Lifecycle"
          icon={<Activity className="w-4 h-4" />}
          onDrilldown={() => setActiveTab('lifecycle')}
        />

        <MetricCard
          title="Releases Planned"
          value={releasesPlanned}
          subtitle="Q4 2026 Pipeline"
          calculation="COUNT(releases) where status IN ('planned', 'on_track')"
          reportingPeriod="Q4 2026"
          dataSource="Jira Release Calendar"
          icon={<Calendar className="w-4 h-4" />}
          onDrilldown={() => setActiveTab('calendar')}
        />

        <MetricCard
          title="Releases Completed"
          value={releasesCompleted}
          subtitle="In Field"
          calculation="COUNT(releases) where status = 'released'"
          reportingPeriod="Q3 - Q4 2026"
          dataSource="LifeGuard OTA Logs"
          severityLevel="success"
          icon={<CheckCircle2 className="w-4 h-4" />}
          onDrilldown={() => setActiveTab('calendar')}
        />

        <MetricCard
          title="Releases At Risk"
          value={releasesAtRisk}
          subtitle="Slipped / Blocked"
          calculation="COUNT(releases) where status IN ('at_risk', 'delayed')"
          reportingPeriod="October 2026"
          dataSource="Jira Release Blocker Filter"
          severityLevel={releasesAtRisk > 0 ? 'critical' : 'normal'}
          trend={{ value: `${releasesAtRisk} delayed`, isPositive: false, label: 'requires sign-off' }}
          icon={<AlertTriangle className="w-4 h-4" />}
          onDrilldown={() => {
            updateFilter('releaseStatuses', ['at_risk', 'delayed']);
            setActiveTab('calendar');
          }}
        />

        <MetricCard
          title="Release Readiness"
          value={`${avgReadiness}%`}
          subtitle="Gate Scorecard"
          calculation="AVG(release.checklist_passed / checklist_total)"
          reportingPeriod="October 2026"
          dataSource="Quality Gate Engine"
          severityLevel={avgReadiness < 75 ? 'warning' : 'normal'}
          icon={<TrendingUp className="w-4 h-4" />}
          onDrilldown={() => setActiveTab('calendar')}
        />

        <MetricCard
          title="Critical CVEs"
          value={openCriticalCVEs}
          subtitle="CVSS >= 9.0 Open"
          calculation="COUNT(cve) where severity='CRITICAL' AND status != 'closed'"
          reportingPeriod="Active Vulnerabilities"
          dataSource="CVE.org & NVD Feed"
          severityLevel={openCriticalCVEs > 0 ? 'critical' : 'normal'}
          icon={<ShieldAlert className="w-4 h-4" />}
          onDrilldown={() => {
            updateFilter('cveSeverities', ['CRITICAL']);
            setActiveTab('cve');
          }}
        />

        <MetricCard
          title="Overdue Remediations"
          value={overdueCVEs}
          subtitle="Breached 30d SLA"
          calculation="COUNT(cve) where target_date < TODAY() AND status NOT IN ('released','verified')"
          reportingPeriod="30-Day Critical SLA"
          dataSource="Security Ops Tracker"
          severityLevel={overdueCVEs > 0 ? 'critical' : 'normal'}
          icon={<Clock className="w-4 h-4" />}
          onDrilldown={() => {
            updateFilter('cveSeverities', ['CRITICAL', 'HIGH']);
            setActiveTab('cve');
          }}
        />

        <MetricCard
          title="Fixes Delivered"
          value={fixesDelivered}
          subtitle="Bugs & Sec Patches"
          calculation="SUM(bug_fixes + security_fixes) on released builds"
          reportingPeriod="September - October 2026"
          dataSource="Jira Changelog Metrics"
          severityLevel="success"
          icon={<GitPullRequest className="w-4 h-4" />}
          onDrilldown={() => setActiveTab('fixes')}
        />
      </div>

      {/* Immediate Escalation Action Items Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Executive Escalation & Immediate Decisions Required
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {criticalActions.length} Actions Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {criticalActions.map((act) => (
            <div
              key={act.id}
              onClick={act.action}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between group ${
                act.severity === 'critical'
                  ? 'bg-rose-950/30 border-rose-800/70 hover:border-rose-500'
                  : 'bg-amber-950/30 border-amber-800/70 hover:border-amber-500'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {act.title}
                  </h4>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0" />
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {act.details}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Owner: {act.owner}</span>
                <span className="text-cyan-400 group-hover:underline">Resolve Action →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Release Health by Platform */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Release Health by Platform
              </h3>
              <p className="text-[11px] text-slate-400">
                On Track vs At Risk vs Delayed releases across Platforms 1 through 5
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              P1 - P5
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="onTrack" name="On Track" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="atRisk" name="At Risk" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="delayed" name="Delayed" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Planned vs Completed Releases */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Monthly Planned vs Completed Releases
              </h3>
              <p className="text-[11px] text-slate-400">
                Delivery predictability & cadence velocity (August - December 2026)
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">2026 Trend</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="planned"
                  name="Planned Releases"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed GA"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="carriedOver"
                  name="Carried Over Fixes"
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: CVE Severity Distribution */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Vulnerability Severity Matrix
              </h3>
              <p className="text-[11px] text-slate-400">
                CVSS v3.1 base score breakdown across all tracked devices
              </p>
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-bold">NVD / CVE.ORG</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {cveBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cveBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {cveBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">Not enough data to calculate distribution</p>
            )}
          </div>
        </div>

        {/* Chart 4: Fixes Completed vs Carried Over */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Defect Fix vs Carry-Over Ratio
              </h3>
              <p className="text-[11px] text-slate-400">
                Engineering throughput vs technical debt accumulation
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Jira Sprint Velocity</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carryOverData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="completedFixes" name="Fixes Resolved" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="carriedOver" name="Carried-Over Debt" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
