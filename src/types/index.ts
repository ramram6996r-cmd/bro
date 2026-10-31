// Core Data Models and Types for Zebra Release Intelligence Platform

export type UserRole =
  | 'executive'        // Senior VP & VP
  | 'senior_management'// Senior Management
  | 'product_manager'  // Product Managers
  | 'engineering_lead' // Engineering Managers & Tech Leads
  | 'software_engineer'// Software & QA Engineers
  | 'security_analyst' // Product Security & Vulnerability Management
  | 'sales'            // Sales Teams (Restricted business-facing)
  | 'general_employee' // General Employees
  | 'administrator';   // Dashboard Administrators

export type VerificationState =
  | 'verified_internal'   // Officially verified through internal engineering sources
  | 'verified_external'   // Verified through official public documentation (techdocs.zebra.com, zebra.com)
  | 'internally_assessed' // Assessed by internal security or release team
  | 'candidate_unverified'// Requires internal verification (e.g. unconfirmed device ID or mapping)
  | 'not_affected'        // Formally determined not affected
  | 'unknown';            // Data unavailable / pending research

export type ReleaseStatus = 'released' | 'on_track' | 'at_risk' | 'delayed' | 'planned';
export type ReleaseType = 'monthly' | 'maintenance' | 'security' | 'hotfix' | 'firmware' | 'major';

export type CVESeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CVEWorkflowStatus =
  | 'identified'
  | 'under_assessment'
  | 'confirmed_affected'
  | 'remediation_planned'
  | 'fix_in_progress'
  | 'fix_implemented'
  | 'released'
  | 'verified'
  | 'closed'
  | 'not_affected'
  | 'risk_accepted'
  | 'false_positive'
  | 'awaiting_vendor_fix';

export type JiraIssueType = 'Bug' | 'Security Vulnerability' | 'Story' | 'Regression' | 'Carry-Over' | 'Task';
export type JiraPriority = 'Highest' | 'High' | 'Medium' | 'Low';
export type JiraStatus = 'Open' | 'In Progress' | 'In Review' | 'Verification Pending' | 'Resolved' | 'Closed' | 'Blocked';

export type LifecycleStatus = 'Active / GA' | 'Mature' | 'End of Sale' | 'End of Engineering Support' | 'End of Service Life' | 'Not Verified';

export interface Platform {
  id: string; // e.g., 'platform-1'
  numericId: 1 | 2 | 3 | 4 | 5;
  name: string; // e.g. "Platform 1: Enterprise Android Mobility"
  codeName: string; // e.g. "Helios / Atlas BSP"
  category: string;
  description: string;
  platformOwner: string;
  productManager: string;
  technicalLead: string;
  currentRelease: string;
  nextPlannedRelease: string;
  latestReleasedVersion: string;
  releaseCadence: string;
  mappedDeviceCount: number;
  openBlockers: number;
  openCriticalCVEs: number;
  releaseReadinessScore: number; // percentage 0-100
  recentChangesCount: number;
}

export interface Device {
  id: string; // e.g. "4490"
  modelNumber: string;
  name: string;
  productFamily: string;
  platformId: string;
  platformNumericId: 1 | 2 | 3 | 4 | 5;
  hardwareGeneration: string;
  category: string;
  description: string;
  supportedOS: string[];
  supportedFirmware: string[];
  supportedSoftware: string[];
  latestVerifiedRelease: string;
  lifecycleStatus: LifecycleStatus;
  verificationState: VerificationState;
  verificationNotes: string;
  officialDocUrl: string;
  supportUrl: string;
  sourceUrl: string;
  sourcePublicationDate: string;
  lastVerificationDate: string;
  openRelevantCVECount: number;
  openRelevantDefectCount: number;
  components: string[];
  successorModel?: string;
  isExampleIdentifier?: boolean;
}

export interface ReleaseMilestone {
  name: string;
  targetDate: string;
  actualDate?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
}

export interface ReadinessChecklistItem {
  id: string;
  criterion: string;
  mandatory: boolean;
  isMet: boolean;
  evidence: string;
  owner: string;
}

export interface Release {
  id: string; // e.g. "rel-p1-2026-10"
  platformId: string;
  platformNumericId: 1 | 2 | 3 | 4 | 5;
  version: string; // e.g. "v2026.10.1"
  name: string; // "October 2026 Mobility Monthly Update"
  releaseType: ReleaseType;
  releaseMonth: string; // "2026-10"
  releaseQuarter: string; // "Q4 2026"
  status: ReleaseStatus;
  plannedReleaseDate: string;
  originalTargetDate: string;
  forecastDate: string;
  actualReleaseDate?: string;
  releaseOwner: string;
  readinessPercentage: number;
  checklist: ReadinessChecklistItem[];
  milestones: ReleaseMilestone[];
  targetDeviceIds: string[];
  associatedJiraKeys: string[];
  associatedCVEs: string[];
  carriedOverIssuesCount: number;
  newFeaturesCount: number;
  bugFixesCount: number;
  securityFixesCount: number;
  customerReleaseNotes: string;
  internalTechnicalNotes: string;
  isDelayed: boolean;
  delayReason?: string;
}

export interface CVEItem {
  id: string; // e.g. "CVE-2026-21844"
  title: string;
  officialDescription: string;
  cvssScore: number;
  cvssVersion: '3.1' | '4.0';
  severity: CVESeverity;
  epssScore: number; // Exploit Prediction Scoring System
  cisaKev: boolean; // Known Exploited Vulnerability catalog
  publishedDate: string;
  lastModifiedDate: string;
  sourceDatabase: 'cve.org' | 'NVD' | 'Zebra Security Advisory' | 'Qualcomm Security Bulletin';
  sourceUrl: string;
  verificationState: VerificationState;
  affectedPlatformIds: string[];
  affectedDeviceIds: string[];
  affectedVersionRanges: string;
  affectedComponents: string[];
  vendorAdvisoryUrl?: string;
  availablePatch: string;
  workflowStatus: CVEWorkflowStatus;
  remediationOwner: string;
  targetRemediationDate: string;
  isOverdue: boolean;
  slaDaysRemaining: number;
  fixVersion: string;
  releaseContainingFix?: string;
  verificationStatus: 'Pending Verification' | 'Engineering Verified' | 'QA Regression Passed' | 'Released to Field';
  internalImpactAssessment: string;
  relatedJiraKeys: string[];
  confidentialExploitNotes?: string; // Restricted to security & engineering
}

export interface JiraIssue {
  key: string; // e.g. "ZEB-4821"
  summary: string;
  issueType: JiraIssueType;
  status: JiraStatus;
  priority: JiraPriority;
  platformId: string;
  deviceIds: string[];
  component: string;
  labels: string[];
  fixVersion: string;
  affectedVersions: string[];
  assignee: string;
  team: string;
  createdDate: string;
  updatedDate: string;
  resolvedDate?: string;
  isBlocker: boolean;
  isCarryOver: boolean; // carried over from previous release
  carriedOverFrom?: string;
  linkedCVEs: string[];
  customerFacingDescription?: string;
  internalTechnicalDetails: string;
}

export interface ProductLifecycleRecord {
  productId: string;
  productName: string;
  deviceIds: string[];
  platformId: string;
  introductionDate: string;
  endOfSaleDate?: string;
  endOfEngineeringSupportDate?: string;
  endOfServiceLifeDate?: string;
  status: LifecycleStatus;
  isPublished: boolean;
  bulletinUrl: string;
  successorProduct: string;
  migrationNotes: string;
  verificationState: VerificationState;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
  title: string;
  message: string;
  platformId?: string;
  deviceId?: string;
  cveId?: string;
  jiraKey?: string;
  read: boolean;
  acknowledged: boolean;
  actionRequired: string;
}

export interface SyncRunLog {
  id: string;
  timestamp: string;
  source: 'Jira Cloud Enterprise' | 'NVD NIST API' | 'CVE.org Service' | 'Zebra TechDocs' | 'Hardware DB';
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  recordsFetched: number;
  recordsUpdated: number;
  durationMs: number;
  details: string;
}

export interface GlobalFilterState {
  searchKeyword: string;
  platformIds: string[]; // empty means all
  productFamilies: string[];
  deviceIds: string[];
  releaseMonths: string[]; // e.g. "2026-10"
  releaseStatuses: ReleaseStatus[];
  cveSeverities: CVESeverity[];
  cveStatuses: CVEWorkflowStatus[];
  lifecycleStatuses: LifecycleStatus[];
}
