/**
 * components/ui/Input.jsx
 * ------------------------------------------------------------------
 * Shared form input primitive. Uses forwardRef so React Hook Form's
 * register() can attach its ref directly — this component is meant
 * to be spread with register("fieldName") props, not manually wired.
 *
 * Error state uses a hardcoded red, not an accent-driven color —
 * same reasoning as WhatsApp green staying hardcoded: an error needs
 * to read as universally alarming regardless of what a given
 * dealership's accent color happens to be (a gold accent, for
 * instance, wouldn't communicate "something's wrong" clearly).
 * ------------------------------------------------------------------
 */

import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, error, className = "", ...props },
  ref
) {
  const fieldId = props.id || props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`rounded-md border bg-surface px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
          error ? "border-red-500" : "border-secondary"
        } ${className}`}
        {...props}
      />
      {error && (
        <span id={`${fieldId}-error`} className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;