# Shared Schema and JSON-LD Migration

## What changed

- Canonical schema source remains `ui/.ldo` and is consumed directly by API.
- API data schemas no longer keep a duplicated Nemaline schema copy.
- New term-policy files are created as `.term-policy.ttl` with `text/turtle`.
- UI can still open legacy `.term-policy.json` resources during migration.
- API data-schema endpoint supports:
  - `/.api/data-schema/:name?view=json` (default, UI-friendly summary)
  - `/.api/data-schema/:name?view=shexj` (raw ShexJ)

## Migration behavior

- New uploads create:
  - `{dataset}.ttl`
  - `{dataset}.term-policy.ttl`
- Existing containers that only have `.term-policy.json` still work:
  - Nemaline view checks `.ttl` first, then `.jsonld`, then `.json`.
  - Term policy view falls back across `.ttl`, `.jsonld`, and `.json`.

## Regression checklist

1. Upload a Nemaline CSV and confirm a `.term-policy.ttl` file is created.
2. Verify upload request media type for the term policy is `text/turtle`.
3. Open "Change term policy" from Nemaline view for:
   - a new dataset (`.jsonld`),
   - a legacy dataset with only `.json`.
4. Call:
   - `/.api/data-schema/nemaline?view=json`
   - `/.api/data-schema/nemaline?view=shexj`
5. Validate statistics adapter behavior with `npm run test:schema-migration`.
