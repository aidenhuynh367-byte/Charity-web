import Link from "next/link";

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <a
          href="https://thecharitylink.org"
          className="text-lg font-semibold text-slate-900 hover:text-slate-700"
        >
          TheCharityLink.org
        </a>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
          <Link href="/login" className="hover:text-slate-900">
            Sign in
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
