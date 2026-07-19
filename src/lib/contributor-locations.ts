/** Contributor profile location options (Bali areas). */
export const CONTRIBUTOR_LOCATIONS = [
  "Babakan",
  "Batu Balong",
  "Berawa",
  "Cemagi",
  "Denpasar",
  "Jimbaran",
  "Kerobokan",
  "Kuta",
  "Legian",
  "Munggu",
  "Nusa Dua",
  "Padonon",
  "Pereranan",
  "Sanur",
  "Seminyak",
  "Seseh",
  "Tanah Lot",
  "Tumbak Bayuh",
  "Ubud",
  "Uluwatu",
  "Umalas",
] as const;

export type ContributorLocation = (typeof CONTRIBUTOR_LOCATIONS)[number];
