"use client";

import { loginWith } from "./actions";

type LoginButtonsProps = {
  showMicrosoftLogin: boolean;
  /** Preserved through OAuth so charity signup (?AddOrg=foobar) still works. */
  callbackUrl?: string | null;
  addOrg?: string | null;
};

export function LoginButtons({
  showMicrosoftLogin,
  callbackUrl,
  addOrg,
}: LoginButtonsProps) {
  return (
    <ul className="mt-8 flex flex-col gap-3">
      <li>
        <form action={loginWith.bind(null, "google")}>
          {callbackUrl ? (
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
          ) : null}
          {addOrg ? (
            <input type="hidden" name="AddOrg" value={addOrg} />
          ) : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Signin with Google
          </button>
        </form>
      </li>
      {showMicrosoftLogin ? (
        <li>
          <form action={loginWith.bind(null, "azure-ad")}>
            <input type="hidden" name="showMSLogin" value="Yes" />
            {callbackUrl ? (
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
            ) : null}
            {addOrg ? (
              <input type="hidden" name="AddOrg" value={addOrg} />
            ) : null}
            <button
              type="submit"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Continue with Microsoft
            </button>
          </form>
        </li>
      ) : null}
    </ul>
  );
}
