import { useState } from "react";
import { timezones } from "./time.ts";

function savedTimezone() {
  try {
    const saved = localStorage.getItem("billable-hours-timezone");
    return timezones.find(([zone]) => zone === saved)?.[0] ?? "America/New_York";
  } catch {
    return "America/New_York";
  }
}

export function useTimezone() {
  const [timezone, setTimezone] = useState<string>(savedTimezone);
  const [error, setError] = useState("");

  function changeTimezone(value: string) {
    setTimezone(value);
    setError("");
    try {
      localStorage.setItem("billable-hours-timezone", value);
    } catch {
      setError("Timezone changed, but your browser could not save the preference.");
    }
  }

  return { timezone, changeTimezone, error };
}
