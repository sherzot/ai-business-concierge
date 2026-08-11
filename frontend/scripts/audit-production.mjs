import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const frontendDir = resolve(import.meta.dirname, "..");
const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const minimumSeverity = severityRank.high;

function fail(message) {
  console.error(`Production audit failed: ${message}`);
  process.exit(1);
}

const audit = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
  cwd: frontendDir,
  encoding: "utf8",
});

if (audit.error) fail(audit.error.message);

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  const diagnostic = (audit.stderr || audit.stdout || "no npm output").trim();
  fail(`npm audit did not return valid JSON: ${diagnostic}`);
}

if (
  report.error ||
  !Object.hasOwn(report, "vulnerabilities") ||
  !Object.hasOwn(report, "metadata")
) {
  const diagnostic =
    report.message ||
    report.error?.summary ||
    report.error?.detail ||
    (audit.stderr || "incomplete npm audit report").trim();
  fail(`npm audit could not complete: ${diagnostic}`);
}

const vulnerabilities = report.vulnerabilities ?? {};

function collectAdvisories(packageName, seen = new Set()) {
  if (seen.has(packageName)) return [];
  seen.add(packageName);

  const vulnerability = vulnerabilities[packageName];
  if (!vulnerability) return [];

  return (vulnerability.via ?? []).flatMap((via) =>
    typeof via === "string"
      ? collectAdvisories(via, seen)
      : [via]
  );
}

const blockingVulnerabilities = Object.values(vulnerabilities).filter(
  (vulnerability) =>
    (severityRank[vulnerability.severity] ?? minimumSeverity) >= minimumSeverity,
);

const unresolvedPackages = [];
const advisoriesByUrl = new Map();
for (const vulnerability of blockingVulnerabilities) {
  const advisories = collectAdvisories(vulnerability.name);
  if (advisories.length === 0) unresolvedPackages.push(vulnerability.name);
  for (const advisory of advisories) advisoriesByUrl.set(advisory.url, advisory);
}

const blockingAdvisories = [...advisoriesByUrl.values()];

if (unresolvedPackages.length > 0) {
  fail(`unresolved high/critical dependency paths: ${unresolvedPackages.join(", ")}`);
}

if (blockingAdvisories.length > 0) {
  for (const advisory of blockingAdvisories) {
    console.error(`- ${advisory.severity}: ${advisory.name} — ${advisory.url}`);
  }
  fail(`${blockingAdvisories.length} high/critical advisory found`);
}

console.log("Production dependency audit passed: 0 high/critical vulnerabilities.");
