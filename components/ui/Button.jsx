/**
 * components/ui/Button.jsx
 * ------------------------------------------------------------------
 * Generic button primitive — for form submits and any non-WhatsApp
 * action. WhatsApp CTAs use WhatsAppButton.jsx instead, which has its
 * own link-building logic; this one is a plain <button> for things
 * like form submission where the parent controls onClick/type/disabled.
 *
 * Colors use the same accent/primary Tailwind utilities wired in
 * app/globals.css — no inline style needed for anything covered by
 * that system.
 * ------------------------------------------------------------------
 */

"use client";

/**
 * @param {object} props
 * @param {"solid"|"outline"} [props.variant]
 * @param {"button"|"submit"} [props.type]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading] - shows a simple loading state, also disables the button
 * @param {() => void} [props.onClick]
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export default function Button({
  variant = "solid",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  children,
}) {
  const isOutline = variant === "outline";
  const isDisabled = disabled || loading;

  const variantClasses = isOutline
    ? "border border-accent text-accent bg-transparent"
    : "bg-accent text-white";

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses} ${className}`}
    >
      {loading ? "Sending…" : children}
    </button>
  );
}