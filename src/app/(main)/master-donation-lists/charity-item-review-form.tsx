"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reviewDonationListItem } from "@/app/actions/donation-list-charity";
import {
  ActionErrorBox,
  LoadingSpinner,
} from "@/components/action-feedback";
import { useI18n } from "@/components/i18n-provider";
import {
  toActionFailure,
  type ActionFailure,
} from "@/lib/action-result";

type Props = {
  itemId: string;
  charityDecision: "ACCEPT" | "NOT_ACCEPT" | null;
};

export function CharityItemReviewForm({ itemId, charityDecision }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<ActionFailure | null>(null);

  function onSelect(decision: "ACCEPT" | "NOT_ACCEPT") {
    setError(null);
    const fd = new FormData();
    fd.set("itemId", itemId);
    fd.set("decision", decision);
    startTransition(async () => {
      try {
        const result = await reviewDonationListItem(fd);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError(toActionFailure(err, "REVIEW_ITEM_FAILED"));
      }
    });
  }

  const groupName = `charity-decision-${itemId}`;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="text-xs font-medium text-slate-600">
        {t("masterLists.reviewLabel")}
      </p>
      <fieldset disabled={isPending} className="mt-2 space-y-2">
        <legend className="sr-only">{t("masterLists.reviewLegend")}</legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
          <input
            type="radio"
            name={groupName}
            value="ACCEPT"
            checked={charityDecision === "ACCEPT"}
            onChange={() => onSelect("ACCEPT")}
            className="h-4 w-4 border-slate-300 text-slate-900"
          />
          {t("decision.accept")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
          <input
            type="radio"
            name={groupName}
            value="NOT_ACCEPT"
            checked={charityDecision === "NOT_ACCEPT"}
            onChange={() => onSelect("NOT_ACCEPT")}
            className="h-4 w-4 border-slate-300 text-slate-900"
          />
          {t("decision.notAccept")}
        </label>
      </fieldset>
      {isPending ? (
        <p className="mt-2 text-xs text-slate-500">
          <LoadingSpinner
            className="h-3.5 w-3.5"
            label={t("masterLists.saving")}
          />
        </p>
      ) : null}
      {error ? (
        <div className="mt-2">
          <ActionErrorBox error={error} />
        </div>
      ) : null}
    </div>
  );
}
