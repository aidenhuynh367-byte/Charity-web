"use client";

import { useActionState } from "react";

import {
  submitCharityResponseToContributor,
  type CharityResponseFormState,
} from "@/app/actions/donation-list-charity";
import {
  ActionErrorBox,
  PendingSubmitButton,
} from "@/components/action-feedback";
import { useI18n } from "@/components/i18n-provider";

type Props = { listId: string; defaultMessage: string };

export function CharityResponseForm({ listId, defaultMessage }: Props) {
  const { t } = useI18n();
  const [state, formAction] = useActionState<
    CharityResponseFormState,
    FormData
  >(submitCharityResponseToContributor, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="listId" value={listId} />
      {state?.error ? <ActionErrorBox error={state.error} /> : null}
      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-medium text-slate-800">
          {t("masterLists.messageLabel")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={8}
          defaultValue={defaultMessage}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
        />
      </div>
      <PendingSubmitButton className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
        {t("masterLists.sendResponse")}
      </PendingSubmitButton>
    </form>
  );
}
