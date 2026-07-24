/**
 * components/ui/TextArea.jsx
 * ------------------------------------------------------------------
 * Shared form textarea primitive — same pattern as Input.jsx
 * (forwardRef for React Hook Form's register(), hardcoded red for
 * error state). See Input.jsx for the reasoning on both.
 * ------------------------------------------------------------------
 */

import { forwardRef } from "react";

const TextArea = forwardRef(function TextArea(
  { label, error, rows = 4, className = "", ...props },
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
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`resize-none rounded-md border bg-surface px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
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

export default TextArea;