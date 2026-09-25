import type { Task } from "./storage.ts";
import { billableHours } from "./time.ts";

interface BillingSummaryProps {
  tasks: Task[];
  filtered: boolean;
}

export function BillingSummary({ tasks, filtered }: BillingSummaryProps) {
  const total = tasks.reduce((sum, task) => sum + billableHours(task.start, task.end), 0);
  const openCount = tasks.filter((task) => !task.end).length;
  return (
    <section className="billing-summary" aria-label="Hours summary">
      <div>
        <span>Billable hours</span>
        <strong>
          {total.toFixed(1)} <small>hrs</small>
        </strong>
      </div>
      <div>
        <span>Open tasks</span>
        <strong>{openCount}</strong>
      </div>
      <p>
        Completed tasks rounded to the nearest 6 minutes.
        <br />
        Minimum 0.1 hours per task. All-time totals{filtered ? " for this client" : ""}.
      </p>
    </section>
  );
}
