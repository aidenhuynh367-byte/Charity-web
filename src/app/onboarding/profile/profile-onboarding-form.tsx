"use client";

import type { Role } from "@prisma/client";
import {
  type FormEvent,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  completeOnboardingProfileAction,
  type FormState,
} from "@/app/actions/profile";
import { ContributorLocationField } from "@/components/contributor-location-field";
import { PhoneCountryFields } from "@/components/phone-country-fields";
import { formText } from "@/lib/form-text";
import {
  charityProfileSchema,
  contributorProfileSchema,
} from "@/lib/validation/profile";
import { formatZodFormError } from "@/lib/validation/zod-form-error";

/** Prefill fields for onboarding (matches Prisma `Profile` phone/WhatsApp columns). */
type ProfileOnboardingSnapshot = {
  organizationName: string | null;
  address: string | null;
  phoneCountry: string | null;
  phoneNationalNumber: string | null;
  charityWhatsappCountry: string | null;
  charityWhatsappNationalNumber: string | null;
  charityEmail: string | null;
  charityLocation: string | null;
  displayName: string | null;
  contributorLocation: string | null;
  contributorWhatsappCountry: string | null;
  contributorWhatsappNationalNumber: string | null;
};

type Props = {
  role: Role;
  initial: ProfileOnboardingSnapshot;
};

export function ProfileOnboardingForm({ role, initial }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(
    completeOnboardingProfileAction,
    null,
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state?.error != null) setClientError(null);
  }, [state?.error]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    if (role === "CHARITY_ORGANIZATION") {
      const parsed = charityProfileSchema.safeParse({
        organizationName: formText(fd, "organizationName"),
        address: formText(fd, "address"),
        charityLocation: formText(fd, "charityLocation"),
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
        <ContributorLocationField
          name="charityLocation"
          defaultValue={initial.charityLocation}
        />
        <PhoneCountryFields
          label="WhatsApp number"
          countryFieldName="charityWhatsappCountry"
          nationalFieldName="charityWhatsappNationalNumber"
          defaultCountry={initial.charityWhatsappCountry}
          defaultNational={initial.charityWhatsappNationalNumber}
        />
        <PhoneCountryFields
          label="Phone number"
          countryFieldName="phoneCountry"
          nationalFieldName="phoneNationalNumber"
          defaultCountry={initial.phoneCountry}
          defaultNational={initial.phoneNationalNumber}
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
          className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Save and continue
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
        className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        Save and continue
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
