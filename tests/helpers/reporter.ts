// Custom Test Reporter for Kohinoor Gemstone QA Automation
// Provides formatted test results and summary statistics

import { TestResult, TestCase } from '@playwright/test';

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  suites: SuiteSummary[];
}

export interface SuiteSummary {
  name: string;
  tests: number;
  passed: number;
  failed: number;
  duration: number;
}

// Format test duration to human-readable string
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

// Generate test summary from results
export function generateSummary(results: TestResult[]): TestSummary {
  const summary: TestSummary = {
    total: results.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    suites: [],
  };

  const suiteMap = new Map<string, SuiteSummary>();

  for (const result of results) {
    const suiteName = result.testFile.split('/').pop() || 'unknown';

    if (!suiteMap.has(suiteName)) {
      suiteMap.set(suiteName, {
        name: suiteName,
        tests: 0,
        passed: 0,
        failed: 0,
        duration: 0,
      });
    }

    const suite = suiteMap.get(suiteName)!;
    suite.tests++;
    suite.duration += result.duration;

    switch (result.status) {
      case 'passed':
        summary.passed++;
        suite.passed++;
        break;
      case 'failed':
        summary.failed++;
        suite.failed++;
        break;
      case 'skipped':
        summary.skipped++;
        break;
    }

    summary.duration += result.duration;
  }

  summary.suites = Array.from(suiteMap.values());
  return summary;
}

// Print formatted summary to console
export function printSummary(summary: TestSummary): void {
  console.log('\n========================================');
  console.log('  Test Results Summary');
  console.log('========================================\n');

  console.log(`Total:   ${summary.total}`);
  console.log(`Passed:  ${summary.passed} ✓`);
  console.log(`Failed:  ${summary.failed} ✗`);
  console.log(`Skipped: ${summary.skipped} ○`);
  console.log(`Duration: ${formatDuration(summary.duration)}`);

  console.log('\n----------------------------------------');
  console.log('  Suite Breakdown');
  console.log('----------------------------------------\n');

  for (const suite of summary.suites) {
    const status = suite.failed > 0 ? '✗' : '✓';
    console.log(`${status} ${suite.name}: ${suite.passed}/${suite.tests} passed (${formatDuration(suite.duration)})`);
  }

  console.log('\n========================================\n');
}

// Check if all tests passed
export function allTestsPassed(summary: TestSummary): boolean {
  return summary.failed === 0;
}

// Get pass rate percentage
export function getPassRate(summary: TestSummary): number {
  if (summary.total === 0) return 0;
  return Math.round((summary.passed / summary.total) * 100);
}
