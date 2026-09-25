import { BackLink } from "../components/back-link.tsx";
import { PageShell } from "../components/page-shell.tsx";

export function NotFoundPage() {
  return (
    <PageShell>
      <title>Page not found · Anaplian.io</title>
      <BackLink />
      <section className="placeholder">
        <span className="status">404</span>
        <h1>Page not found</h1>
        <p>There’s nothing at this address. Head back home.</p>
      </section>
    </PageShell>
  );
}
