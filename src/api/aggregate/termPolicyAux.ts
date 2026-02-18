/**
 * Term policy as a Solid auxiliary resource.
 * Convention: auxiliary URL = document URL + TERM_POLICY_SUFFIX.
 * See https://solidproject.org/TR/protocol#auxiliary-resources
 */

import {
  readableToString,
  APPLICATION_LD_JSON,
  type ResourceStore,
  type ResourceIdentifier,
} from "@solid/community-server";
import { getGlobals } from "../../globals";

/** Suffix for the term policy auxiliary resource (appended to the document URL). */
export const TERM_POLICY_SUFFIX = ".term-policy";

/**
 * Return the URL of the term policy auxiliary resource for a given document URL.
 * Example: https://mypod.com/admin/nemaline_findings.ttl → https://mypod.com/admin/nemaline_findings.ttl.term-policy
 */
export function getTermPolicyAuxUrl(documentUrl: string): string {
  const trimmed = documentUrl.replace(/\/$/, "");
  return `${trimmed}${TERM_POLICY_SUFFIX}`;
}

/**
 * Convert a full URL to the path used by the resource store (pathname only).
 * Example: https://mypod.com/admin/nemaline_findings.ttl.term-policy → /admin/nemaline_findings.ttl.term-policy
 */
export function urlToResourcePath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

/**
 * Load the term policy auxiliary resource from the Pod as JSON-LD string.
 * Uses resourceStore.getRepresentation with application/ld+json preference.
 */
export async function loadTermPolicyFromPod(
  documentUrl: string,
): Promise<string> {
  const { resourceStore } = getGlobals();
  if (!resourceStore) {
    throw new Error("resourceStore not configured; cannot load term policy from Pod.");
  }
  const auxUrl = getTermPolicyAuxUrl(documentUrl);
  const path = urlToResourcePath(auxUrl);
  const identifier: ResourceIdentifier = { path };
  const representation = await resourceStore.getRepresentation(identifier, {
    type: { [APPLICATION_LD_JSON]: 1 },
  });
  const jsonLdString = await readableToString(representation.data);
  return jsonLdString;
}
