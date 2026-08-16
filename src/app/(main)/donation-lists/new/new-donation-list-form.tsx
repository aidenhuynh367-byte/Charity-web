"use client";

import { useActionState } from "react";

import {
  createDonationList,
  type DonationListFormState,
} from "@/app/actions/donation-lists";
import {
  ActionErrorBox,
  PendingSubmitButton,
} from "@/components/action-feedback";
import { useI18n } from "@/components/i18n-provider";

export function NewDonationListForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState<DonationListFormState, FormData>(
    createDonationList,
    null,
  );

  return (
    <form action={formAction} className="mt-8 max-w-md space-y-4">
      {state?.error ? <ActionErrorBox error={state.error} /> : null}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-slate-800">
          {t("donationLists.fieldName")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={200}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          placeholder={t("donationLists.namePlaceholder")}
        />
      </div>
      <PendingSubmitButton className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
        {t("donationLists.create")}
      </PendingSubmitButton>
    </form>
  );
}
