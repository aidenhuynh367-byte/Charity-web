"use client";

import { loginWith } from "./actions";

export function LoginButtons() {
  return (
    <ul className="mt-8 flex flex-col gap-3">
      <li>
        <form action={loginWith.bind(null, "google")}>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Continue with Google
          </button>
        </form>
      </li>
      <li>
        <form action={loginWith.bind(null, "facebook")}>
          <button
            type="submit"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Continue with Facebook
          </button>
        </form>
      </li>
      <li>
        <form action={loginWith.bind(null, "azure-ad")}>
          <button
            type="submit"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Continue with Microsoft
          </button>
        </form>
      </li>
      <li>
        <form action={loginWith.bind(null, "instagram")}>
          <button
            type="submit"
            className="w-full rounded-lg border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-medium text-pink-900 hover:bg-pink-100"
          >
            Continue with Instagram
          </button>
        </form>
      </li>
    </ul>
  );
}
