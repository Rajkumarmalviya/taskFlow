import type { Priority } from "../types/task";

interface PriorityFilterProps {
  value: Priority | "ALL";
  onChange: (
    value: Priority | "ALL"
  ) => void;
}

export default function PriorityFilter({
  value,
  onChange
}: PriorityFilterProps) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value as
            | Priority
            | "ALL"
        )
      }
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
    >
      <option value="ALL">
        All priorities
      </option>

      <option value="HIGH">
        High
      </option>

      <option value="MEDIUM">
        Medium
      </option>

      <option value="LOW">
        Low
      </option>
    </select>
  );
}