import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  UserRole,
  GlobalFilterState,
  Platform,
  Device,
  Release,
  CVEItem,
  JiraIssue,
  ProductLifecycleRecord,
  AlertNotification,
  SyncRunLog,
  CVEWorkflowStatus,
  ReleaseStatus,
  JiraStatus,
  VerificationState,
} from '../types';
import {
  INITIAL_PLATFORMS,
  INITIAL_DEVICES,
  INITIAL_RELEASES,
  INITIAL_CVES,
  INITIAL_JIRA_ISSUES,
  INITIAL_LIFECYCLE_RECORDS,
  INITIAL_ALERTS,
  INITIAL_SYNC_LOGS,
} from '../data/mockData';

export interface SavedFilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<GlobalFilterState>;
}

export const DEFAULT_FILTERS: GlobalFilterState = {
  searchKeyword: '',
  platformIds: [],
  productFamilies: [],
  deviceIds: [],
  releaseMonths: [],
  releaseStatuses: [],
  cveSeverities: [],
  cveStatuses: [],
  lifecycleStatuses: [],
};

const INITIAL_SAVED_PRESETS: SavedFilterPreset[] = [
  {
    id: 'preset-1',
    name: 'Critical CVEs & At-Risk Items',
    description: 'Critical and High severity vulnerabilities across all platforms requiring immediate review',
    filters: {
      cveSeverities: ['CRITICAL', 'HIGH'],
      releaseStatuses: ['at_risk', 'delayed'],
    },
  },
  {
    id: 'preset-2',
    name: 'Platform 1 Mobility Scope',
    description: 'All handheld devices, BSP candidate 4490, and Q4 monthly releases',
    filters: {
      platformIds: ['platform-1'],
    },
  },
  {
    id: 'preset-3',
    name: 'October 2026 Monthly Release Cycle',
    description: 'Current active release cycle status across all 5 Zebra platforms',
    filters: {
      releaseMonths: ['2026-10'],
    },
  },
  {
    id: 'preset-4',
    name: 'Internal Candidate Devices (4490, 33605, 5841)',
    description: 'Identifiers requiring internal hardware BOM validation',
    filters: {
      deviceIds: ['4490', '33605', '5841'],
    },
  },
];

interface PlatformContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  filters: GlobalFilterState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilterState>>;
  updateFilter: <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;

  savedPresets: SavedFilterPreset[];
  applyPreset: (presetId: string) => void;
  saveNewPreset: (name: string, description: string) => void;

  // Selected for modals / detail drawers
  selectedDevice: Device | null;
  setSelectedDevice: (d: Device | null) => void;
  selectedCVE: CVEItem | null;
  setSelectedCVE: (c: CVEItem | null) => void;
  selectedRelease: Release | null;
  setSelectedRelease: (r: Release | null) => void;
  selectedJiraIssue: JiraIssue | null;
  setSelectedJiraIssue: (j: JiraIssue | null) => void;

  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Raw data collections
  platforms: Platform[];
  devices: Device[];
  releases: Release[];
  cves: CVEItem[];
  jiraIssues: JiraIssue[];
  lifecycleRecords: ProductLifecycleRecord[];
  alerts: AlertNotification[];
  syncLogs: SyncRunLog[];
  lastSyncTimestamp: Date;
  isSyncing: boolean;

  // Mutations
  updateCVEWorkflow: (cveId: string, newStatus: CVEWorkflowStatus, notes?: string) => void;
  updateReleaseStatus: (releaseId: string, newStatus: ReleaseStatus, forecastDate?: string, reason?: string) => void;
  updateJiraStatus: (key: string, newStatus: JiraStatus) => void;
  acknowledgeAlert: (alertId: string) => void;
  verifyDeviceMapping: (deviceId: string, newState: VerificationState, notes?: string) => void;
  triggerDataSync: (source?: string) => Promise<void>;

  // Filtered collections respecting both user filters AND role permissions
  filteredPlatforms: Platform[];
  filteredDevices: Device[];
  filteredReleases: Release[];
  filteredCVEs: CVEItem[];
  filteredJiraIssues: JiraIssue[];
  filteredLifecycle: ProductLifecycleRecord[];
  filteredAlerts: AlertNotification[];

  // Role permissions check helpers
  canViewInternalTechNotes: boolean;
  canViewRestrictedExploits: boolean;
  canTriggerSync: boolean;
  canEditWorkflows: boolean;
  canViewUnreleasedData: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('executive');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('executive');
  const [filters, setFilters] = useState<GlobalFilterState>(DEFAULT_FILTERS);
  const [savedPresets, setSavedPresets] = useState<SavedFilterPreset[]>(INITIAL_SAVED_PRESETS);

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedCVE, setSelectedCVE] = useState<CVEItem | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [selectedJiraIssue, setSelectedJiraIssue] = useState<JiraIssue | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  const [platforms, setPlatforms] = useState<Platform[]>(INITIAL_PLATFORMS);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [releases, setReleases] = useState<Release[]>(INITIAL_RELEASES);
  const [cves, setCves] = useState<CVEItem[]>(INITIAL_CVES);
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>(INITIAL_JIRA_ISSUES);
  const [lifecycleRecords, setLifecycleRecords] = useState<ProductLifecycleRecord[]>(INITIAL_LIFECYCLE_RECORDS);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [syncLogs, setSyncLogs] = useState<SyncRunLog[]>(INITIAL_SYNC_LOGS);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<Date>(new Date(Date.now() - 1000 * 60 * 18));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Role permissions evaluation
  const canViewInternalTechNotes = role !== 'sales' && role !== 'general_employee';
  const canViewRestrictedExploits = role === 'security_analyst' || role === 'engineering_lead' || role === 'administrator';
  const canTriggerSync = role === 'administrator' || role === 'engineering_lead' || role === 'security_analyst';
  const canEditWorkflows = role === 'security_analyst' || role === 'product_manager' || role === 'engineering_lead' || role === 'administrator';
  const canViewUnreleasedData = role !== 'sales' && role !== 'general_employee';

  const updateFilter = <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchKeyword) count++;
    if (filters.platformIds.length > 0) count += filters.platformIds.length;
    if (filters.productFamilies.length > 0) count += filters.productFamilies.length;
    if (filters.deviceIds.length > 0) count += filters.deviceIds.length;
    if (filters.releaseMonths.length > 0) count += filters.releaseMonths.length;
    if (filters.releaseStatuses.length > 0) count += filters.releaseStatuses.length;
    if (filters.cveSeverities.length > 0) count += filters.cveSeverities.length;
    if (filters.cveStatuses.length > 0) count += filters.cveStatuses.length;
    if (filters.lifecycleStatuses.length > 0) count += filters.lifecycleStatuses.length;
    return count;
  }, [filters]);

  const applyPreset = (presetId: string) => {
    const preset = savedPresets.find((p) => p.id === presetId);
    if (preset) {
      setFilters({
        ...DEFAULT_FILTERS,
        ...preset.filters,
      });
    }
  };

  const saveNewPreset = (name: string, description: string) => {
    const newPreset: SavedFilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      filters: { ...filters },
    };
    setSavedPresets((prev) => [newPreset, ...prev]);
  };

  // Mutations
  const updateCVEWorkflow = (cveId: string, newStatus: CVEWorkflowStatus, notes?: string) => {
    setCves((prev) =>
      prev.map((cve) => {
        if (cve.id === cveId) {
          return {
            ...cve,
            workflowStatus: newStatus,
            internalImpactAssessment: notes
              ? `${cve.internalImpactAssessment} [Updated ${new Date().toISOString().slice(0, 10)}: ${notes}]`
              : cve.internalImpactAssessment,
          };
        }
        return cve;
      })
    );
  };

  const updateReleaseStatus = (
    releaseId: string,
    newStatus: ReleaseStatus,
    forecastDate?: string,
    reason?: string
  ) => {
    setReleases((prev) =>
      prev.map((rel) => {
        if (rel.id === releaseId) {
          return {
            ...rel,
            status: newStatus,
            forecastDate: forecastDate || rel.forecastDate,
            isDelayed: newStatus === 'delayed' || newStatus === 'at_risk',
            delayReason: reason || rel.delayReason,
          };
        }
        return rel;
      })
    );
  };

  const updateJiraStatus = (key: string, newStatus: JiraStatus) => {
    setJiraIssues((prev) =>
      prev.map((issue) => {
        if (issue.key === key) {
          return {
            ...issue,
            status: newStatus,
            updatedDate: new Date().toISOString().slice(0, 10),
            resolvedDate: newStatus === 'Resolved' || newStatus === 'Closed' ? new Date().toISOString().slice(0, 10) : undefined,
          };
        }
        return issue;
      })
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alt) => (alt.id === alertId ? { ...alt, acknowledged: true, read: true } : alt))
    );
  };

  const verifyDeviceMapping = (deviceId: string, newState: VerificationState, notes?: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === deviceId) {
          return {
            ...dev,
            verificationState: newState,
            verificationNotes: notes || dev.verificationNotes,
            lastVerificationDate: new Date().toISOString().slice(0, 10),
          };
        }
        return dev;
      })
    );
  };

  const triggerDataSync = async (source = 'All Sources') => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const now = new Date();
    setLastSyncTimestamp(now);
    const newLog: SyncRunLog = {
      id: `sync-${Date.now()}`,
      timestamp: now.toISOString(),
      source: source as any,
      status: 'SUCCESS',
      recordsFetched: Math.floor(Math.random() * 80) + 20,
      recordsUpdated: Math.floor(Math.random() * 12) + 1,
      durationMs: 1420,
      details: `Scheduled delta synchronization executed by role ${role}. Live data cache updated and indexes re-evaluated.`,
    };
    setSyncLogs((prev) => [newLog, ...prev]);
    setIsSyncing(false);
  };

  // Filtered collections logic
  const filteredPlatforms = useMemo(() => {
    return platforms.filter((plat) => {
      if (filters.platformIds.length > 0 && !filters.platformIds.includes(plat.id)) {
        return false;
      }
      if (filters.searchKeyword) {
        const kw = filters.searchKeyword.toLowerCase();
        const matches =
          plat.name.toLowerCase().includes(kw) ||
          plat.codeName.toLowerCase().includes(kw) ||
          plat.description.toLowerCase().includes(kw) ||
          plat.category.toLowerCase().includes(kw);
        if (!matches) return false;
      }
      return true;
    });
  }, [platforms, filters]);

  const filteredDevices = useMemo(() => {
    return devices.filter((dev) => {
      // Role enforcement: Sales and general employee only see verified external or internal devices
      if (!canViewUnreleasedData && dev.verificationState === 'candidate_unverified') {
        return false;
      }

      if (filters.platformIds.length > 0 && !filters.platformIds.includes(dev.platformId)) {
        return false;
      }
      if (filters.productFamilies.length > 0 && !filters.productFamilies.includes(dev.productFamily)) {
        return false;
      }
      if (filters.deviceIds.length > 0 && !filters.deviceIds.includes(dev.id)) {
        return false;
      }
      if (filters.lifecycleStatuses.length > 0 && !filters.lifecycleStatuses.includes(dev.lifecycleStatus)) {
        return false;
      }
      if (filters.searchKeyword) {
        const kw = filters.searchKeyword.toLowerCase();
        const matches =
          dev.id.toLowerCase().includes(kw) ||
          dev.modelNumber.toLowerCase().includes(kw) ||
          dev.name.toLowerCase().includes(kw) ||
          dev.description.toLowerCase().includes(kw) ||
          dev.category.toLowerCase().includes(kw) ||
          dev.components.some((c) => c.toLowerCase().includes(kw));
        if (!matches) return false;
      }
      return true;
    });
  }, [devices, filters, canViewUnreleasedData]);

  const filteredReleases = useMemo(() => {
    return releases.filter((rel) => {
      // Role check: sales only sees officially released versions
      if (!canViewUnreleasedData && rel.status !== 'released') {
        return false;
      }

      if (filters.platformIds.length > 0 && !filters.platformIds.includes(rel.platformId)) {
        return false;
      }
      if (filters.releaseMonths.length > 0 && !filters.releaseMonths.includes(rel.releaseMonth)) {
        return false;
      }
      if (filters.releaseStatuses.length > 0 && !filters.releaseStatuses.includes(rel.status)) {
        return false;
      }
      if (filters.deviceIds.length > 0) {
        const hasDevice = rel.targetDeviceIds.some((dId) => filters.deviceIds.includes(dId));
        if (!hasDevice) return false;
      }
      if (filters.searchKeyword) {
        const kw = filters.searchKeyword.toLowerCase();
        const matches =
          rel.version.toLowerCase().includes(kw) ||
          rel.name.toLowerCase().includes(kw) ||
          rel.customerReleaseNotes.toLowerCase().includes(kw) ||
          rel.releaseOwner.toLowerCase().includes(kw);
        if (!matches) return false;
      }
      return true;
    });
  }, [releases, filters, canViewUnreleasedData]);

  const filteredCVEs = useMemo(() => {
    return cves.filter((cve) => {
      // Role check: sales team only sees CVEs if they have been released/verified publicly
      if (!canViewUnreleasedData && (cve.workflowStatus === 'identified' || cve.workflowStatus === 'under_assessment')) {
        return false;
      }

      if (filters.platformIds.length > 0) {
        const hasPlatform = cve.affectedPlatformIds.some((pId) => filters.platformIds.includes(pId));
        if (!hasPlatform) return false;
      }
      if (filters.deviceIds.length > 0) {
        const hasDevice = cve.affectedDeviceIds.some((dId) => filters.deviceIds.includes(dId));
        if (!hasDevice) return false;
      }
      if (filters.cveSeverities.length > 0 && !filters.cveSeverities.includes(cve.severity)) {
        return false;
      }
      if (filters.cveStatuses.length > 0 && !filters.cveStatuses.includes(cve.workflowStatus)) {
        return false;
      }
      if (filters.searchKeyword) {
        const kw = filters.searchKeyword.toLowerCase();
        const matches =
          cve.id.toLowerCase().includes(kw) ||
          cve.title.toLowerCase().includes(kw) ||
          cve.officialDescription.toLowerCase().includes(kw) ||
          cve.affectedComponents.some((comp) => comp.toLowerCase().includes(kw));
        if (!matches) return false;
      }
      return true;
    });
  }, [cves, filters, canViewUnreleasedData]);

  const filteredJiraIssues = useMemo(() => {
    return jiraIssues.filter((issue) => {
      // Role check: sales only sees issues if customer-facing notes exist and resolved
      if (!canViewUnreleasedData && (!issue.customerFacingDescription || issue.status !== 'Resolved')) {
        return false;
      }

      if (filters.platformIds.length > 0 && !filters.platformIds.includes(issue.platformId)) {
        return false;
      }
      if (filters.deviceIds.length > 0) {
        const hasDevice = issue.deviceIds.some((dId) => filters.deviceIds.includes(dId));
        if (!hasDevice) return false;
      }
      if (filters.searchKeyword) {
        const kw = filters.searchKeyword.toLowerCase();
        const matches =
          issue.key.toLowerCase().includes(kw) ||
          issue.summary.toLowerCase().includes(kw) ||
          issue.component.toLowerCase().includes(kw) ||
          issue.assignee.toLowerCase().includes(kw) ||
          issue.labels.some((l) => l.toLowerCase().includes(kw));
        if (!matches) return false;
      }
      return true;
    });
  }, [jiraIssues, filters, canViewUnreleasedData]);

  const filteredLifecycle = useMemo(() => {
    return lifecycleRecords.filter((rec) => {
      if (!canViewUnreleasedData && !rec.isPublished) {
        return false;
      }
      if (filters.platformIds.length > 0 && !filters.platformIds.includes(rec.platformId)) {
        return false;
      }
      if (filters.lifecycleStatuses.length > 0 && !filters.lifecycleStatuses.includes(rec.status)) {
        return false;
      }
      if (filters.deviceIds.length > 0) {
        const hasDevice = rec.deviceIds.some((dId) => filters.deviceIds.includes(dId));
        if (!hasDevice) return false;
      }
      if (filters.searchKeyword) {
        const kw = filters.searchKeyword.toLowerCase();
        const matches =
          rec.productName.toLowerCase().includes(kw) ||
          rec.successorProduct.toLowerCase().includes(kw) ||
          rec.migrationNotes.toLowerCase().includes(kw);
        if (!matches) return false;
      }
      return true;
    });
  }, [lifecycleRecords, filters, canViewUnreleasedData]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alt) => {
      if (filters.platformIds.length > 0 && alt.platformId && !filters.platformIds.includes(alt.platformId)) {
        return false;
      }
      if (filters.deviceIds.length > 0 && alt.deviceId && !filters.deviceIds.includes(alt.deviceId)) {
        return false;
      }
      return true;
    });
  }, [alerts, filters]);

  return (
    <PlatformContext.Provider
      value={{
        role,
        setRole,
        isDemoMode,
        setIsDemoMode,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        activeFilterCount,
        savedPresets,
        applyPreset,
        saveNewPreset,
        selectedDevice,
        setSelectedDevice,
        selectedCVE,
        setSelectedCVE,
        selectedRelease,
        setSelectedRelease,
        selectedJiraIssue,
        setSelectedJiraIssue,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        platforms,
        devices,
        releases,
        cves,
        jiraIssues,
        lifecycleRecords,
        alerts,
        syncLogs,
        lastSyncTimestamp,
        isSyncing,
        updateCVEWorkflow,
        updateReleaseStatus,
        updateJiraStatus,
        acknowledgeAlert,
        verifyDeviceMapping,
        triggerDataSync,
        filteredPlatforms,
        filteredDevices,
        filteredReleases,
        filteredCVEs,
        filteredJiraIssues,
        filteredLifecycle,
        filteredAlerts,
        canViewInternalTechNotes,
        canViewRestrictedExploits,
        canTriggerSync,
        canEditWorkflows,
        canViewUnreleasedData,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
