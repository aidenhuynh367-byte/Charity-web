"use client";

import { useActionState } from "react";

import { setRoleAction, type FormState } from "@/app/actions/profile";

export function RoleForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    setRoleAction,
    null,
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state?.error ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <fieldset className="space-y-4">
        <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300">
          <input type="radio" name="role" value="CHARITY_ORGANIZATION" required />
          <span>
            <span className="block font-medium text-slate-900">
              Charity organization
            </span>
            <span className="text-sm text-slate-600">
              Register your organization to receive support.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300">
          <input type="radio" name="role" value="CONTRIBUTOR" required />
          <span>
            <span className="block font-medium text-slate-900">Contributor</span>
            <span className="text-sm text-slate-600">
              Offer help or donations to charities.
            </span>
          </span>
        </label>
      </fieldset>
      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
      >
        Continue
      </button>
    </form>
  );
}
