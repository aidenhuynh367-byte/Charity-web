import { CONTRIBUTOR_LOCATIONS } from "@/lib/contributor-locations";

type Props = {
  /** Form field name / id. Defaults to contributorLocation. */
  name?: string;
  defaultValue?: string | null;
};

export function ContributorLocationField({
  name = "contributorLocation",
  defaultValue,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-800">
        Location
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
      >
        <option value="" disabled>
          Select a location
        </option>
        {CONTRIBUTOR_LOCATIONS.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
    </div>
  );
}
