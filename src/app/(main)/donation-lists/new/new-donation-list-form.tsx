"use client";

import { useActionState } from "react";

import {
  createDonationList,
  type DonationListFormState,
} from "@/app/actions/donation-lists";

export function NewDonationListForm() {
  const [state, formAction] = useActionState<DonationListFormState, FormData>(
    createDonationList,
    null,
  );

  return (
    <form action={formAction} className="mt-8 max-w-md space-y-4">
      {state?.error ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-slate-800">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={200}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          placeholder="e.g. Winter food drive"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Create list
      </button>
    </form>
  );
}
