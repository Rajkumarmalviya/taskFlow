import type { Priority } from "../../types/task";
import { Select } from "../../ui";

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
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as Priority | "ALL")}
      className=""
    >
      <option value="ALL">All priorities</option>
      <option value="HIGH">High</option>
      <option value="MEDIUM">Medium</option>
      <option value="LOW">Low</option>
    </Select>
  );
}
