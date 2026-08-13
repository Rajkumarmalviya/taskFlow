import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldSource = "body" | "params" | "query";

interface FieldRule {
  /** Where to look for the value */
  source?: FieldSource;
  /** Require the field to be present and non-empty */
  required?: boolean;
  /** Accepted string values (for enum validation) */
  oneOf?: string[];
  /** Value must be castable to a positive integer */
  isPositiveInt?: boolean;
  /** String value must not exceed this character count */
  maxLength?: number;
  /** Custom predicate; return an error message string on failure, or null on pass */
  custom?: (value: unknown) => string | null;
}

type Schema = Record<string, FieldRule>;

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Validate a single value against its rule.
 * Returns an error string or null.
 */
function validateField(key: string, value: unknown, rule: FieldRule): string | null {
  // required check
  if (rule.required) {
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "");
    if (isEmpty) return `"${key}" is required`;
  }

  // Skip further checks when the value is absent and not required
  if (value === undefined || value === null) return null;

  // enum check
  if (rule.oneOf && !rule.oneOf.includes(String(value))) {
    return `"${key}" must be one of: ${rule.oneOf.join(", ")}`;
  }

  // positive integer check
  if (rule.isPositiveInt) {
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      return `"${key}" must be a positive integer`;
    }
  }

  // maxLength check
  if (rule.maxLength !== undefined && typeof value === "string") {
    if (value.length > rule.maxLength) {
      return `"${key}" must not exceed ${rule.maxLength} characters`;
    }
  }

  // custom check
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
}

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * Returns an Express middleware that validates the request against `schema`.
 * Any validation error throws an AppError(400) which the global handler catches.
 *
 * @example
 * router.post("/", validate({
 *   columnId: { source: "body", required: true, isPositiveInt: true },
 *   title:    { source: "body", required: true },
 *   priority: { source: "body", oneOf: ["LOW", "MEDIUM", "HIGH"] },
 * }), createTaskController);
 */
export function validate(schema: Schema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const [key, rule] of Object.entries(schema)) {
      const source = rule.source ?? "body";
      const bag =
        source === "body"
          ? req.body
          : source === "params"
          ? req.params
          : req.query;

      const error = validateField(key, bag[key], rule);
      if (error) errors.push(error);
    }

    if (errors.length > 0) {
      next(new AppError(errors.join("; "), 400));
      return;
    }

    next();
  };
}
