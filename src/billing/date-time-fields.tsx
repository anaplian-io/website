import type { DateTimeFields as DateTimeValue } from "./task-draft.ts";

interface DateTimeFieldsProps {
  label: string;
  value: DateTimeValue;
  onChange: (value: DateTimeValue) => void;
}

export function DateTimeFields({ label, value, onChange }: DateTimeFieldsProps) {
  return (
    <div className="date-time-row">
      <label>
        {label} date
        <input
          required
          type="date"
          value={value.date}
          onChange={(event) => onChange({ ...value, date: event.target.value })}
        />
      </label>
      <label>
        {label} time
        <input
          required
          type="time"
          step="1"
          value={value.time}
          onChange={(event) => onChange({ ...value, time: event.target.value })}
        />
      </label>
    </div>
  );
}
