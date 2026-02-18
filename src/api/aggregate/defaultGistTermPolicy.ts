/**
 * Default Gist-structured term policy (JSON-LD) for use when creating the auxiliary resource.
 * Example: dataset-level Count; field-level Mean and GroupBy for common fields.
 * The UI or server can PUT this to the term policy aux URL when creating a new governed document.
 */

/** Default term policy as JSON-LD (Gist: Permission + Specification, isCategorizedBy Mean/Count/GroupBy). */
export function getDefaultGistTermPolicyJsonLd(documentUrl: string): string {
  const doc = documentUrl.replace(/\/$/, "");
  const GIST = "https://w3id.org/semanticarts/ns/ontology/gist/";
  const EX = "http://example.org/analytics/";
  return JSON.stringify(
    {
      "@context": {
        "@vocab": GIST,
        ex: EX,
        type: "@type",
        isAbout: { "@id": "isAbout", "@type": "@id" },
        allows: { "@id": "allows", "@type": "@id", "@container": "@set" },
        isCategorizedBy: { "@id": "isCategorizedBy", "@type": "@id" },
      },
      "@graph": [
        {
          "@id": `${doc}${doc.includes("#") ? "" : "#policy-dataset"}`,
          type: "Permission",
          isAbout: { "@id": doc },
          allows: [
            {
              type: "Specification",
              isCategorizedBy: { "@id": `${EX}Count` },
            },
          ],
        },
        {
          "@id": `${doc}#policy-field-age`,
          type: "Permission",
          isAbout: { "@id": `${doc}#bl1_nmy_ady` },
          allows: [
            { type: "Specification", isCategorizedBy: { "@id": `${EX}Mean` } },
          ],
        },
        {
          "@id": `${doc}#policy-field-gender`,
          type: "Permission",
          isAbout: { "@id": `${doc}#bl1_dem_gen` },
          allows: [
            {
              type: "Specification",
              isCategorizedBy: { "@id": `${EX}GroupBy` },
            },
          ],
        },
      ],
    },
    null,
    2,
  );
}
