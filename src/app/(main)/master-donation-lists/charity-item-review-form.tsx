"use client";

import { useState, useTransition } from "react";

import { reviewDonationListItem } from "@/app/actions/donation-list-charity";

type Props = {
  itemId: string;
  charityDecision: "ACCEPT" | "NOT_ACCEPT" | null;
};

export function CharityItemReviewForm({ itemId, charityDecision }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSelect(decision: "ACCEPT" | "NOT_ACCEPT") {
    setError(null);
    const fd = new FormData();
    fd.set("itemId", itemId);
    fd.set("decision", decision);
    startTransition(async () => {
      const result = await reviewDonationListItem(fd);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  const groupName = `charity-decision-${itemId}`;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="text-xs font-medium text-slate-600">Charity review</p>
      <fieldset disabled={isPending} className="mt-2 space-y-2">
        <legend className="sr-only">Accept or not accept this item</legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
          <input
            type="radio"
            name={groupName}
            value="ACCEPT"
            checked={charityDecision === "ACCEPT"}
            onChange={() => onSelect("ACCEPT")}
            className="h-4 w-4 border-slate-300 text-slate-900"
          />
          Accept
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
          Not Accept
        </label>
      </fieldset>
      {isPending ? (
        <p className="mt-2 text-xs text-slate-500">Saving…</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
