"use client";

import { useFormStatus } from "react-dom";

import { useI18n } from "@/components/i18n-provider";
import type { ActionFailure } from "@/lib/action-result";

export function LoadingSpinner({
  className = "h-4 w-4",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-2"
      role="status"
      aria-live="polite"
    >
      <svg
        className={`animate-spin text-current ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label ? <span>{label}</span> : null}
    </span>
  );
}

export function ActionErrorBox({ error }: { error: ActionFailure }) {
  const { t } = useI18n();

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
    >
      <p className="font-semibold">{t("common.errorTitle")}</p>
      <p className="mt-1 whitespace-pre-wrap">{error.message}</p>
      <p className="mt-2 font-mono text-xs text-red-800">
        {t("common.errorCode", { code: error.code })}
      </p>
    </div>
  );
}

type PendingSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
};

/** Must be rendered inside a `<form>` that uses a server action / formAction. */
export function PendingSubmitButton({
  children,
  className,
  pendingLabel,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  const label = pendingLabel ?? t("common.loading");

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? <LoadingSpinner label={label} /> : children}
    </button>
  );
}
