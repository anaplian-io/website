import { AppCard } from "../components/app-card.tsx";
import { PageShell } from "../components/page-shell.tsx";
import { SocialLinks } from "../components/social-links.tsx";

export function HomePage() {
  return (
    <PageShell>
      <title>Ethan Fortner — Software Engineer in NYC | Anaplian.io</title>
      <header className="identity">
        <h1>Anaplian.io</h1>
        <a className="email-link" href="mailto:ethan@anaplian.io">
          ethan@anaplian.io
        </a>
        <SocialLinks />
      </header>
      <section className="apps-section" aria-labelledby="apps-heading">
        <h2 id="apps-heading">
          Apps <span aria-hidden="true">⚡️</span>
        </h2>
        <ul className="app-list">
          <li>
            <AppCard
              title="Billable hours"
              description="A billable hours calculator for attorneys."
              href="/apps/billable-hours"
            />
          </li>
        </ul>
      </section>
    </PageShell>
  );
}
