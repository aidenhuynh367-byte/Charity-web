"use client";

import type { Profile, Role } from "@prisma/client";
import { useActionState, useEffect, useState, useTransition } from "react";

import { updateProfileAction, type FormState } from "@/app/actions/profile";
import { ContributorLocationField } from "@/components/contributor-location-field";
import { PhoneCountryFields } from "@/components/phone-country-fields";
import { formText } from "@/lib/form-text";
import {
  charityProfileSchema,
  contributorProfileSchema,
} from "@/lib/validation/profile";
import { formatZodFormError } from "@/lib/validation/zod-form-error";

type Props = {
  role: Role;
  initial: Profile;
};

export function ProfileEditForm({ role, initial }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(
    updateProfileAction,
    null,
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state?.error != null) setClientError(null);
  }, [state?.error]);

  useEffect(() => {
    if (state?.ok) setClientError(null);
  }, [state?.ok]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (role === "CHARITY_ORGANIZATION") {
      const parsed = charityProfileSchema.safeParse({
        organizationName: formText(fd, "organizationName"),
        address: formText(fd, "address"),
        phoneCountry: formText(fd, "phoneCountry"),
        phoneNationalNumber: formText(fd, "phoneNationalNumber"),
        charityWhatsappCountry: formText(fd, "charityWhatsappCountry"),
        charityWhatsappNationalNumber: formText(
          fd,
          "charityWhatsappNationalNumber",
        ),
        charityEmail: formText(fd, "charityEmail"),
      });
      if (!parsed.success) {
        setClientError(formatZodFormError(parsed.error));
        return;
      }
    } else {
      const parsed = contributorProfileSchema.safeParse({
        displayName: formText(fd, "displayName"),
        contributorLocation: formText(fd, "contributorLocation"),
        contributorWhatsappCountry: formText(
          fd,
          "contributorWhatsappCountry",
        ),
        contributorWhatsappNationalNumber: formText(
          fd,
          "contributorWhatsappNationalNumber",
        ),
      });
      if (!parsed.success) {
        setClientError(formatZodFormError(parsed.error));
        return;
      }
    }

    setClientError(null);
    startTransition(() => {
      formAction(fd);
    });
  }

  const banner = clientError ?? state?.error;

  if (role === "CHARITY_ORGANIZATION") {
    return (
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {banner ? (
          <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {banner}
          </p>
        ) : null}
        {state?.ok ? (
          <p className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Profile saved.
          </p>
        ) : null}
        <Field
          label="Organization name"
          name="organizationName"
          defaultValue={initial.organizationName ?? ""}
        />
        <Field
          label="Address"
          name="address"
          defaultValue={initial.address ?? ""}
        />
        <PhoneCountryFields
          label="Phone number"
          countryFieldName="phoneCountry"
          nationalFieldName="phoneNationalNumber"
          defaultCountry={initial.phoneCountry}
          defaultNational={initial.phoneNationalNumber}
        />
        <PhoneCountryFields
          label="WhatsApp number"
          countryFieldName="charityWhatsappCountry"
          nationalFieldName="charityWhatsappNationalNumber"
          defaultCountry={initial.charityWhatsappCountry}
          defaultNational={initial.charityWhatsappNationalNumber}
        />
        <Field
          label="Email"
          name="charityEmail"
          type="text"
          autoComplete="email"
          defaultValue={initial.charityEmail ?? ""}
        />
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Save changes
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {banner ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {banner}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Profile saved.
        </p>
      ) : null}
      <Field
        label="Name"
        name="displayName"
        defaultValue={initial.displayName ?? ""}
      />
      <ContributorLocationField defaultValue={initial.contributorLocation} />
      <PhoneCountryFields
        label="WhatsApp number"
        countryFieldName="contributorWhatsappCountry"
        nationalFieldName="contributorWhatsappNationalNumber"
        defaultCountry={initial.contributorWhatsappCountry}
        defaultNational={initial.contributorWhatsappNationalNumber}
      />
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        Save changes
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
      />
    </div>
  );
}
