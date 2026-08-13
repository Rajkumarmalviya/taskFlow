import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id?: string;
  className?: string;
}

export default function Select({ label, id, className = "", children, ...props }: SelectProps) {
  return (
    <div>
      {label && <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>}
      <select id={id} className={["w-full rounded-lg border border-slate-300 px-3 py-2", className].join(" ")} {...props}>
        {children}
      </select>
    </div>
  );
}
