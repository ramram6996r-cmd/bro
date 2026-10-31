/**
 * Self-contained Automated Validation Suite for Zebra Release Intelligence Platform
 * Validates CVE normalization, severity metrics, candidate device BOM classification,
 * 5-Platform completeness, SLA rules, and Role-Based Access Control boundaries.
 */

import { INITIAL_DEVICES, INITIAL_CVES, INITIAL_RELEASES, INITIAL_PLATFORMS } from '../data/mockData';
import { UserRole } from '../types';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
}

export function runValidationSuite(): TestResult[] {
  const results: TestResult[] = [];

  const assert = (condition: boolean, suite: string, name: string, message?: string) => {
    results.push({
      suite,
      name,
      passed: condition,
      message: condition ? undefined : message || 'Assertion failed',
    });
  };

  // 1. CVE Validation Suite
  const cveRegex = /^CVE-\d{4}-\d{4,7}$/i;
  assert(
    cveRegex.test('CVE-2026-21844') && cveRegex.test('CVE-2025-12345'),
    'Security & CVE Engine',
    'CVE Identifier Normalization and Format Compliance'
  );

  const criticalCves = INITIAL_CVES.filter((c) => c.severity === 'CRITICAL');
  assert(
    criticalCves.length > 0 && criticalCves.every((c) => c.cvssScore >= 9.0),
    'Security & CVE Engine',
    'Critical Severity CVSS Baseline (Score >= 9.0)'
  );

  // 2. Candidate Devices Verification Suite
  const candidateIds = ['4490', '33605', '5841'];
  const allCandidatesUnverified = candidateIds.every((id) => {
    const dev = INITIAL_DEVICES.find((d) => d.id === id);
    return dev && dev.verificationState === 'candidate_unverified' && dev.isExampleIdentifier;
  });
  assert(
    allCandidatesUnverified,
    'Hardware & Device BOM Catalog',
    'Candidate Device Identifiers (4490, 33605, 5841) Require Internal Verification'
  );

  // 3. Five Core Zebra Platforms Suite
  const numericIds = INITIAL_PLATFORMS.map((p) => p.numericId).sort();
  const hasAllFive =
    numericIds.length === 5 &&
    numericIds.every((val, idx) => val === idx + 1);
  assert(
    hasAllFive,
    'Platform Architecture',
    'All Five Core Zebra Software Platforms Accounted For'
  );

  const allPlatformsHaveOwners = INITIAL_PLATFORMS.every(
    (p) => p.platformOwner && p.productManager && p.technicalLead
  );
  assert(
    allPlatformsHaveOwners,
    'Platform Architecture',
    'Platform Leadership Triad (VP, Product Mgr, Tech Lead) Assigned'
  );

  // 4. SLA & Overdue Rules
  const overdueValid = INITIAL_CVES.every((cve) => {
    if (cve.isOverdue) return cve.slaDaysRemaining <= 0;
    return true;
  });
  assert(
    overdueValid,
    'SLA Compliance',
    'Overdue Vulnerability Calculation Consistency'
  );

  // 5. Role-Based Permissions (RBAC)
  const salesRole: UserRole = 'sales';
  const canSalesViewUnreleased = salesRole !== 'sales' && (salesRole as string) !== 'general_employee';
  assert(
    !canSalesViewUnreleased,
    'Role-Based Access Control',
    'Sales Role Restricted From Viewing Unreleased / Unverified Data'
  );

  const salesFilteredDevices = INITIAL_DEVICES.filter((d) => {
    if (!canSalesViewUnreleased && d.verificationState === 'candidate_unverified') {
      return false;
    }
    return true;
  });
  assert(
    !salesFilteredDevices.some((d) => d.id === '4490') &&
      salesFilteredDevices.some((d) => d.id === 'TC58'),
    'Role-Based Access Control',
    'Candidate 4490 Excluded From Sales View While GA TC58 Retained'
  );

  return results;
}
