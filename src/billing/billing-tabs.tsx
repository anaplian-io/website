export type BillingTab = "tasks" | "clients";

interface BillingTabsProps {
  tab: BillingTab;
  clientCount: number;
  onChange: (tab: BillingTab) => void;
}

export function BillingTabs({ tab, clientCount, onChange }: BillingTabsProps) {
  return (
    <nav className="billing-tabs" aria-label="Billable hours sections">
      <button aria-current={tab === "tasks" ? "page" : undefined} onClick={() => onChange("tasks")}>
        Tasks
      </button>
      <button
        aria-current={tab === "clients" ? "page" : undefined}
        onClick={() => onChange("clients")}
      >
        Clients <span>{clientCount}</span>
      </button>
    </nav>
  );
}
