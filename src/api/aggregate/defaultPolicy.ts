/**
 * Default term policy for development and example. Replace with Pod-owner-defined policy
 * (e.g. loaded from .well-known/ld-term-policy or config).
 */

import type { TermPolicy } from "./types";

/** Example policy: mean age (bl1_nmy_ady) and groupby gender (bl1_dem_gen) allowed. */
export const defaultTermPolicy: TermPolicy = {
  "@context": "https://setmeld.com/vocab/term-policy/context.jsonld",
  "@id": "https://api.example.org/.well-known/ld-term-policy",
  "@type": "TermPolicy",
  subject: "https://api.example.org/datasets/nm-baseline-v1",
  entrypoint: "https://api.example.org",
  minCellSize: 5,
  datasetAllowedTerms: ["COUNT"],
  fields: [
    {
      "@type": "Field",
      fieldName: "bl1_eli_nam",
      name: "Name of eligibility assessor",
      description: "PII of the assessor (blocked).",
      datatype: "string",
      allowedTerms: [],
    },
    {
      "@type": "Field",
      fieldName: "bl1_dem_gen",
      name: "Gender assigned at birth",
      description: "1=Male, 0=Female.",
      datatype: "integer",
      allowedTerms: ["WHERE", "GROUP_BY"],
    },
    {
      "@type": "Field",
      fieldName: "bl1_nmy_ady",
      name: "Age of diagnosis (years)",
      datatype: "integer",
      allowedTerms: ["WHERE", "AVERAGE"],
    },
    {
      "@type": "Field",
      fieldName: "bl1_mht_car7",
      name: "Cardiovascular medical condition 7",
      datatype: "string",
      allowedTerms: ["WHERE", "GROUP_BY"],
    },
  ],
};
