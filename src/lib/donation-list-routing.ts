/**
 * Contributor locations routed to the Padonon charity organization.
 * All other locations (including missing) go to Denpasar.
 */
export const PADONON_ROUTE_LOCATIONS = [
  "Babakan",
  "Batu Balong",
  "Berawa",
  "Cemagi",
  "Munggu",
  "Padonon",
  "Pereranan",
  "Seseh",
  "Tanah Lot",
  "Tumbak Bayuh",
  "Ubud",
] as const;

export type PadononRouteLocation = (typeof PADONON_ROUTE_LOCATIONS)[number];

const PADONON_ROUTE_SET = new Set<string>(PADONON_ROUTE_LOCATIONS);

export type RoutedCharityLocation = "Padonon" | "Denpasar";

export function routedCharityLocationForContributor(
  contributorLocation: string | null | undefined,
): RoutedCharityLocation {
  if (
    contributorLocation &&
    PADONON_ROUTE_SET.has(contributorLocation)
  ) {
    return "Padonon";
  }
  return "Denpasar";
}
