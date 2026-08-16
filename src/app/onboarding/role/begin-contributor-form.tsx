"use client";

import { useActionState } from "react";

import { setRoleAction, type FormState } from "@/app/actions/profile";
import { useI18n } from "@/components/i18n-provider";

export function BeginContributorForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState<FormState, FormData>(
    setRoleAction,
    null,
  );

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <input type="hidden" name="role" value="CONTRIBUTOR" />
      {state?.error ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-4 text-xl font-semibold text-white hover:bg-slate-800"
      >
        {t("onboarding.begin")}
      </button>
    </form>
  );
}
