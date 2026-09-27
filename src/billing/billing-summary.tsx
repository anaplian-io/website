import type { TaskTotals } from "./storage.ts";

interface BillingSummaryProps {
  totals: TaskTotals;
  filtered: boolean;
}

export function BillingSummary({ totals, filtered }: BillingSummaryProps) {
  return (
    <section className="billing-summary" aria-label="Hours summary">
      <div>
        <span>Billable hours</span>
        <strong>
          {totals.hours.toFixed(1)} <small>hrs</small>
        </strong>
      </div>
      <div>
        <span>Open tasks</span>
        <strong>{totals.openCount}</strong>
      </div>
      <p>
        Completed tasks rounded to the nearest 6 minutes.
        <br />
        Minimum 0.1 hours per task. All-time totals{filtered ? " for this client" : ""}.
      </p>
    </section>
  );
}
