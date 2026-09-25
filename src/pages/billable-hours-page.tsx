import { useState } from "react";
import { BackLink } from "../components/back-link.tsx";
import { BillingHeader } from "../billing/billing-header.tsx";
import { BillingTabs } from "../billing/billing-tabs.tsx";
import type { BillingTab } from "../billing/billing-tabs.tsx";
import { BillingError } from "../billing/billing-error.tsx";
import { ClientManager } from "../billing/client-manager.tsx";
import { TaskWorkspace } from "../billing/task-workspace.tsx";
import type { TaskEditor } from "../billing/task-workspace.tsx";
import { useBillingRecords } from "../billing/use-billing-records.ts";
import { useTimezone } from "../billing/use-timezone.ts";

export function BillableHoursPage() {
  const records = useBillingRecords();
  const timezone = useTimezone();
  const [tab, setTab] = useState<BillingTab>("tasks");
  const [editor, setEditor] = useState<TaskEditor>(null);
  const [filter, setFilter] = useState("");

  function changeTab(value: BillingTab) {
    setTab(value);
    setEditor(null);
  }

  async function deleteClient(id: string) {
    await records.deleteClient(id);
    if (filter === id) setFilter("");
  }

  return (
    <main className="billing-shell">
      <title>Billable hours · Anaplian.io</title>
      <BackLink />
      <BillingHeader
        timezone={timezone.timezone}
        disabled={editor !== null}
        onTimezoneChange={timezone.changeTimezone}
      />
      <BillingTabs tab={tab} clientCount={records.clients.length} onChange={changeTab} />
      <BillingError message={records.error || timezone.error} />
      {records.loading ? (
        <p role="status">Loading your records…</p>
      ) : tab === "clients" ? (
        <ClientManager
          clients={records.clients}
          tasks={records.tasks}
          onSave={records.saveClient}
          onDelete={deleteClient}
        />
      ) : (
        <TaskWorkspace
          clients={records.clients}
          tasks={records.tasks}
          timezone={timezone.timezone}
          filter={filter}
          editor={editor}
          onFilter={setFilter}
          onEdit={setEditor}
          onAddClient={() => changeTab("clients")}
          onSave={records.saveTask}
          onDelete={records.deleteTask}
        />
      )}
    </main>
  );
}
