import Image from "next/image";
import Link from "next/link";

const PEOPLE = [
  {
    name: "Charity Link project team",
    role: "Product, development, and community coordination",
  },
  {
    name: "CCS students and volunteers",
    role: "Community outreach and initiative support",
  },
  {
    name: "Local charity partners",
    role: "Receiving and distributing donated items",
  },
] as const;

export default function AboutPage() {
  return (
    <main>
      <h1 className="text-2xl font-bold text-slate-900">About</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        Charity Link helps people donate gently used items to local charities
        supporting those in need. This initiative is associated with{" "}
        <a
          href="https://www.ccsbali.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-medium underline hover:text-slate-900"
        >
          CCS (Canggu Community School)
          <Image
            src="/ccs-logo.png"
            alt="Canggu Community School logo"
            width={173}
            height={173}
            className="h-[10.8rem] w-[10.8rem] rounded-full object-cover"
          />
        </a>
        .
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          People associated with this app
        </h2>
        <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {PEOPLE.map((person) => (
            <li key={person.name} className="px-4 py-3">
              <p className="font-medium text-slate-900">{person.name}</p>
              <p className="mt-0.5 text-sm text-slate-600">{person.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-sm text-slate-500">
        See also the{" "}
        <Link href="/faq" className="underline hover:text-slate-800">
          FAQ
        </Link>
        .
      </p>
    </main>
  );
}
