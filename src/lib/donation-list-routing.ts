/**
 * All submitted donation lists are currently routed to the Denpasar charity
 * organization, regardless of contributor location.
 */

export type RoutedCharityLocation = "Padonon" | "Denpasar";

export function routedCharityLocationForContributor(
  _contributorLocation: string | null | undefined,
): RoutedCharityLocation {
  return "Denpasar";
}
