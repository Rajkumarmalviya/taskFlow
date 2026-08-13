import React from "react";

type Variant = "HIGH" | "MEDIUM" | "LOW" | "default";

interface BadgeProps {
  variant?: Variant;
  dot?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, { badge: string; dot: string }> = {
  HIGH: {
    badge: "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium bg-red-50 text-red-700 border-red-200",
    dot: "h-2 w-2 rounded-full bg-red-500",
  },
  MEDIUM: {
    badge: "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium bg-amber-50 text-amber-700 border-amber-200",
    dot: "h-2 w-2 rounded-full bg-amber-400",
  },
  LOW: {
    badge: "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "h-2 w-2 rounded-full bg-emerald-500",
  },
  default: {
    badge: "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-sm font-medium bg-white text-slate-700 border-slate-200",
    dot: "h-2 w-2 rounded-full bg-slate-400",
  },
};

export default function Badge({ variant = "default", dot = false, className = "", children, }: BadgeProps) {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;

  return (
    <span className={[styles.badge, className].join(" ")}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
