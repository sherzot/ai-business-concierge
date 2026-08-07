import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const frontendDir = resolve(import.meta.dirname, "..");
const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const minimumSeverity = severityRank.high;

// npm's global advisory metadata still marks React Router 7.18.2 vulnerable,
// while the upstream repository advisory identifies 7.18.2 as the patched v7
// release. Keep this exception narrow and time-bounded so it cannot hide a new
// advisory or survive without review.
const metadataExceptions = new Map([
  [
    "https://github.com/advisories/GHSA-qwww-vcr4-c8h2",
    {
      packageName: "react-router",
      patchedVersion: "7.18.2",
      reviewBy: "2026-08-21",
      evidence:
        "https://github.com/remix-run/react-router/security/advisories/GHSA-qwww-vcr4-c8h2",
    },
  ],
]);

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
const lockfile = JSON.parse(
  readFileSync(resolve(frontendDir, "package-lock.json"), "utf8"),
);

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

function isExcepted(advisory) {
  const exception = metadataExceptions.get(advisory.url);
  if (!exception || exception.packageName !== advisory.name) return false;

  const installedVersion =
    lockfile.packages?.[`node_modules/${exception.packageName}`]?.version;
  const today = new Date().toISOString().slice(0, 10);

  return installedVersion === exception.patchedVersion &&
    today <= exception.reviewBy;
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

const blockingAdvisories = [...advisoriesByUrl.values()].filter(
  (advisory) => !isExcepted(advisory),
);

if (unresolvedPackages.length > 0) {
  fail(`unresolved high/critical dependency paths: ${unresolvedPackages.join(", ")}`);
}

if (blockingAdvisories.length > 0) {
  for (const advisory of blockingAdvisories) {
    console.error(`- ${advisory.severity}: ${advisory.name} — ${advisory.url}`);
  }
  fail(`${blockingAdvisories.length} high/critical advisory found`);
}

if (blockingVulnerabilities.length === 0) {
  console.log("Production dependency audit passed: 0 high/critical vulnerabilities.");
} else {
  for (const [url, exception] of metadataExceptions) {
    if (advisoriesByUrl.has(url)) {
      console.warn(
        `Temporary npm metadata exception: ${url}; ` +
          `${exception.packageName}@${exception.patchedVersion}; ` +
          `review by ${exception.reviewBy}; upstream: ${exception.evidence}`,
      );
    }
  }
  console.log(
    "Production dependency audit passed: no unexcepted high/critical advisories.",
  );
}
