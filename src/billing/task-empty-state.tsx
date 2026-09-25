interface TaskEmptyStateProps {
  hasClients: boolean;
  filtered: boolean;
  onAddClient: () => void;
}

export function TaskEmptyState({ hasClients, filtered, onAddClient }: TaskEmptyStateProps) {
  return (
    <section className="billing-empty">
      <h2>{hasClients ? "No tasks" : "Start with a client."}</h2>
      {hasClients ? (
        <p>Add a task{filtered ? " for this client" : ""} to track billable hours.</p>
      ) : (
        <>
          <p>Add a client, then track your first task.</p>
          <button className="primary-button" onClick={onAddClient}>
            Add your first client
          </button>
        </>
      )}
    </section>
  );
}
