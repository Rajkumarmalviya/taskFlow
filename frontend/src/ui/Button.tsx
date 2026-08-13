import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base = "rounded-lg px-4 py-2 text-sm font-medium focus:outline-none";

  const variants: Record<string, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    secondary: "border bg-white text-slate-700 hover:bg-slate-50",
    danger: "border border-red-200 text-red-600 hover:bg-red-50",
  };

  return (
    <button className={[base, variants[variant], className].join(" ")} {...props} />
  );
}
