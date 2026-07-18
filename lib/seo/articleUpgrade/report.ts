import type { ArticleUpgradeManifestReport } from "./types";

function yesNo(value: boolean): string {
  return value ? "yes" : "no";
}

export function renderArticleUpgradeReport(
  report: ArticleUpgradeManifestReport,
): string {
  const lines = [
    "# Article Upgrade Evaluation",
    "",
    `- Status: ${report.status}`,
    `- As of: ${report.asOf ?? "unavailable"}`,
    `- Provenance: ${report.provenance ?? "unavailable"}`,
    `- Data mode: ${report.dataMode ?? "unavailable"}`,
    `- Manifest digest: ${report.manifestDigest ?? "unavailable"}`,
    `- Schema valid: ${yesNo(report.schemaValid)}`,
    `- Evidence verified: ${yesNo(report.evidenceVerified)}`,
    `- Authorized for execution: ${yesNo(report.authorizedForExecution)}`,
    `- Production execution: ${yesNo(report.productionExecution)}`,
    `- Disposition: ${report.disposition}`,
    `- Previewable: ${yesNo(report.previewable)}`,
    `- Simulation ready: ${yesNo(report.simulationReady)}`,
    `- Executable: ${yesNo(report.executable)}`,
    `- Complete: ${yesNo(report.complete)}`,
    "",
    "| Ticket | Rank | Target | Status | Disposition | Rollback baseline digest | Evidence verified | Authorized | Executable | Reasons |",
    "| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const ticket of report.tickets) {
    lines.push(
      `| ${ticket.ticketId} | ${ticket.rank} | ${ticket.target?.url ?? "unassigned"} | ${ticket.status} | ${ticket.disposition} | ${ticket.rollbackBaselineDigest ?? "unavailable"} | ${yesNo(ticket.evidenceVerified)} | ${yesNo(ticket.authorizedForExecution)} | ${yesNo(ticket.executable)} | ${ticket.reasonCodes.join(", ") || "none"} |`,
    );
  }

  lines.push("", "## Issues", "");
  if (report.issues.length === 0) {
    lines.push(
      "No contract issues. Execution still requires a trusted external resolver, an authorization attestation, a separate writer, and proof of execution.",
    );
  } else {
    for (const item of report.issues) {
      lines.push(
        `- [${item.severity}] ${item.code} at ${item.path}: ${item.message}`,
      );
    }
  }

  lines.push(
    "",
    "This report is evaluative only. Self-reported approvals, evidence, or ledger status cannot authorize execution. The evaluator does not write article content, generate tracking parameters, publish, deploy, submit for indexing, prove ranking, execute rollback, or mark a ticket complete.",
    "",
  );
  return lines.join("\n");
}
