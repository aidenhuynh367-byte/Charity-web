"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  ActionErrorBox,
  LoadingSpinner,
} from "@/components/action-feedback";
import { useI18n } from "@/components/i18n-provider";
import {
  toActionFailure,
  type ActionFailure,
  type ActionFormState,
} from "@/lib/action-result";

type Props = {
  action: (formData: FormData) => Promise<ActionFormState>;
  children: React.ReactNode;
  className?: string;
  buttonClassName: string;
  pendingLabel?: string;
  hiddenFields?: Record<string, string>;
};

/**
 * Client form for mutation buttons that need a spinner + structured error box.
 */
export function PendingActionForm({
  action,
  children,
  className,
  buttonClassName,
  pendingLabel,
  hiddenFields,
}: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<ActionFailure | null>(null);

  return (
    <form
      className={className ? `flex flex-col items-stretch gap-2 ${className}` : "flex flex-col items-stretch gap-2"}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          try {
            const result = await action(fd);
            if (result?.error) {
              setError(result.error);
              return;
            }
            router.refresh();
          } catch (err) {
            if (isRedirectError(err)) throw err;
            setError(toActionFailure(err));
          }
        });
      }}
    >
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      {error ? <ActionErrorBox error={error} /> : null}
      <button
        type="submit"
        disabled={isPending}
        className={buttonClassName}
      >
        {isPending ? (
          <LoadingSpinner label={pendingLabel ?? t("common.loading")} />
        ) : (
          children
        )}
      </button>
    </form>
  );
}
