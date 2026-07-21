import Image from "next/image";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { authConfig } from "@/auth.config";

import { LoginButtons } from "./login-buttons";
import { LoginSlideshow } from "./login-slideshow";

type LoginSearchParams = { [key: string]: string | string[] | undefined };

function loginErrorMessage(code: string | undefined): string | null {
  switch (code) {
    case "stale_session":
      return "Your account was not found in the database (or the session is outdated). Sign in again.";
    case "database":
      return "Cannot reach the database. Check DATABASE_URL, ensure Postgres is running, then restart the dev server.";
    case "migration":
      return "Database tables are missing. From the project folder run: npx prisma migrate dev (or npx prisma db push).";
    default:
      return null;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const noticeCode = typeof params.notice === "string" ? params.notice : undefined;
  const showMicrosoftLogin = params.showMSLogin === "Yes";

  const session = await auth();

  // JWT can still list a user id after the DB user was removed — clear cookie or /login ↔ /dashboard loops.
  if (errorCode === "stale_session" && session?.user) {
    await signOut({ redirectTo: "/login?notice=stale_session" });
  }

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const errorBanner = loginErrorMessage(noticeCode ?? errorCode);

  const count = authConfig.providers?.length ?? 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <header className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/mainlogo.png"
          alt="Charity Link"
          width={280}
          height={140}
          className="h-auto w-56 sm:w-72"
          priority
        />
        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          TheCharityLink.org
        </p>
      </header>
      <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Charity Link is an application that helps connect you with a local
        charity to help you donate your gently used items to help those in need.
        There are many local orphanages that need your kindness and support to
        help all the children in need. Please join us and give whatever you can,
        every little bit helps. Thank you.
      </p>
      <LoginSlideshow />
      {errorBanner ? (
        <p className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {errorBanner}
        </p>
      ) : null}
      {count === 0 ? (
        <p className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No OAuth providers are configured. Copy{" "}
          <code className="rounded bg-white px-1">.env.example</code> to{" "}
          <code className="rounded bg-white px-1">.env</code> and set at least
          one provider&apos;s client ID and secret.
        </p>
      ) : (
        <LoginButtons showMicrosoftLogin={showMicrosoftLogin} />
      )}
    </div>
  );
}
