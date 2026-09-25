import { timezones } from "./time.ts";

interface BillingHeaderProps {
  timezone: string;
  disabled: boolean;
  onTimezoneChange: (value: string) => void;
}

export function BillingHeader({ timezone, disabled, onTimezoneChange }: BillingHeaderProps) {
  return (
    <header className="billing-header">
      <div>
        <h1>Billable hours</h1>
      </div>
      <label className="timezone-label">
        Timezone
        <select
          disabled={disabled}
          value={timezone}
          onChange={(event) => onTimezoneChange(event.target.value)}
        >
          {timezones.map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
