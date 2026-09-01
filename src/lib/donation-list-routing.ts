/**
 * Contributor locations routed to the Denpasar charity organization.
 * All other locations (including missing) go to Kerobokan.
 */
export const DENPASAR_ROUTE_LOCATIONS = [
  "Babakan",
  "Batu Balong",
  "Berawa",
  "Cemagi",
  "Munggu",
  "Pereranan",
  "Seseh",
  "Tanah Lot",
  "Tumbak Bayuh",
  "Ubud",
] as const;

export type DenpasarRouteLocation = (typeof DENPASAR_ROUTE_LOCATIONS)[number];

const DENPASAR_ROUTE_SET = new Set<string>(DENPASAR_ROUTE_LOCATIONS);

export type RoutedCharityLocation = "Denpasar" | "Kerobokan";

export function routedCharityLocationForContributor(
  contributorLocation: string | null | undefined,
): RoutedCharityLocation {
  if (
    contributorLocation &&
    DENPASAR_ROUTE_SET.has(contributorLocation)
  ) {
    return "Denpasar";
  }
  return "Kerobokan";
}
