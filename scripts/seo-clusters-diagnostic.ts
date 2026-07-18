import { clusterRegistry } from "../content/seo/clusters";
import { readAllArticles } from "../lib/seo/articleReader";
import { buildClusterMembershipReport } from "../lib/seo/clusterDiagnostic";

const { articles } = readAllArticles({ mode: "compatibility" });
const report = buildClusterMembershipReport(clusterRegistry, articles);

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
