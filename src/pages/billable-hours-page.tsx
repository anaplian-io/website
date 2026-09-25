import { BackLink } from "../components/back-link.tsx";
import { PageShell } from "../components/page-shell.tsx";

export function BillableHoursPage() {
  return (
    <PageShell>
      <title>Billable hours · Anaplian.io</title>
      <BackLink />
      <section className="placeholder" aria-labelledby="page-heading">
        <span className="status">Coming soon</span>
        <h1 id="page-heading">Billable hours</h1>
        <p>A billable hours calculator for attorneys.</p>
        <p className="muted">A little less counting. A little more time.</p>
      </section>
    </PageShell>
  );
}
