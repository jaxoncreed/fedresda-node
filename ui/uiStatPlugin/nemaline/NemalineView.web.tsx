/**
 * Web-only implementation using a semantic HTML table for reliable layout and styling.
 */
import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Badge, LoadingBar, useViewContext } from 'linked-data-browser';
import { useResource, useMatchSubject } from '@ldo/solid-react';
import { AssessmentEventShapeType } from '../../shared/schemas';
import type { AssessmentEvent, Subject } from '../../shared/schemas';

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const GIST_DETERMINATION = 'https://w3id.org/semanticarts/ns/ontology/gist/Determination';

function getMagnitude(
  subject: Subject,
  aspectId: 'AspectAge' | 'AspectAgeOfOnset',
): number | undefined {
  const mags = subject.hasMagnitude;
  if (!mags) return undefined;
  const getAspectId = (m: unknown): string | undefined => {
    const hasAspect = (m as { hasAspect?: { '@id'?: string } | { toArray?: () => Array<{ '@id'?: string }> } }).hasAspect;
    if (hasAspect == null) return undefined;
    const first = typeof (hasAspect as { toArray?: () => unknown[] }).toArray === 'function'
      ? (hasAspect as { toArray: () => Array<{ '@id'?: string }> }).toArray()?.[0]
      : (hasAspect as { '@id'?: string });
    return (first as { '@id'?: string })?.['@id'];
  };
  const arr = mags.toArray?.() ?? (mags as Iterable<unknown>[]);
  const matches = (aspect: string | undefined): boolean => {
    if (!aspect) return false;
    if (aspectId === 'AspectAgeOfOnset') return aspect.endsWith('Aspect_AgeOfOnset') || aspect === 'AspectAgeOfOnset';
    return (aspect.endsWith('Aspect_Age') && !aspect.endsWith('Aspect_AgeOfOnset')) || aspect === 'AspectAge';
  };
  for (const m of arr) {
    const aspect = getAspectId(m);
    if (matches(aspect)) {
      const v = (m as { numericValue?: number })?.numericValue;
      return typeof v === 'number' ? v : undefined;
    }
  }
  return undefined;
}

function getCategories(subject: Subject): string[] {
  const cats = subject.isCategorizedBy;
  if (!cats) return [];
  const arr = cats.toArray?.() ?? (cats as Iterable<{ '@id'?: string }>[]);
  return arr
    .map((c) => c?.['@id'])
    .filter((id): id is string => typeof id === 'string');
}

function labelFromId(id: string): string {
  const last = id.split('/').pop() ?? id;
  return last.replace(/-/g, ' ');
}

type Align = 'left' | 'right' | 'center';

const COLUMNS: ReadonlyArray<{ key: string; label: string; align: Align }> = [
  { key: 'id', label: 'ID', align: 'right' },
  { key: 'cluster', label: 'Cluster', align: 'left' },
  { key: 'genetic', label: 'Genetic group', align: 'left' },
  { key: 'baselineAge', label: 'Baseline age', align: 'right' },
  { key: 'ambulation', label: 'Ambulation', align: 'left' },
  { key: 'loaAge', label: 'LoA age', align: 'right' },
  { key: 'dominantHand', label: 'Dominant hand', align: 'left' },
  { key: 'totalMfm', label: 'Total MFM', align: 'right' },
  { key: 'belowAvg', label: 'Below avg.', align: 'center' },
];

export function NemalineView() {
  const { targetUri } = useViewContext();
  const resource = useResource(targetUri);
  const events = useMatchSubject(
    AssessmentEventShapeType,
    RDF_TYPE,
    GIST_DETERMINATION,
  );

  const sortedEvents = useMemo(() => {
    const arr = events?.toArray?.() ?? (events ? [...events] : []);
    return (arr as AssessmentEvent[]).sort((a, b) => {
      const idA = a.isIdentifiedBy?.uniqueText ?? '';
      const idB = b.isIdentifiedBy?.uniqueText ?? '';
      return Number(idA) - Number(idB) || String(idA).localeCompare(String(idB));
    });
  }, [events]);

  const isLoading = resource?.isLoading?.() ?? resource?.status?.type === 'unfetched';

  if (!targetUri || !resource) return null;

  if (resource.type === 'InvalidIdentifierResource') {
    return (
      <View style={styles.container}>
        <Text>Invalid resource.</Text>
      </View>
    );
  }

  const thClass = (align: Align) =>
    align === 'right' ? 'nemaline-th-right' : align === 'center' ? 'nemaline-th-center' : 'nemaline-th-left';
  const tdClass = (align: Align) =>
    align === 'right' ? 'nemaline-td-right' : align === 'center' ? 'nemaline-td-center' : 'nemaline-td-left';

  return (
    <View style={styles.container}>
      <LoadingBar isLoading={!!isLoading} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text variant="h1" style={styles.title}>
          Nemaline Myopathy Assessments
        </Text>
        <Text variant="muted" style={styles.subtitle}>
          {sortedEvents.length} assessment{sortedEvents.length === 1 ? '' : 's'}
        </Text>
        <View style={styles.tableWrapper}>
          <table className="nemaline-table">
            <colgroup>
              {COLUMNS.map((col) => (
                <col
                  key={col.key}
                  className={`col-${col.key.replace(/([A-Z])/g, '-$1').toLowerCase()}`}
                />
              ))}
            </colgroup>
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} className={thClass(col.align)} scope="col">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event, rowIndex) => {
                const subj = event.hasParticipant;
                const cats = getCategories(subj);
                const cluster = cats.find((c) => /C[123]/.test(c));
                const genetic = cats.find((c) => /variant[123]/.test(c));
                const ambulation = cats.find((c) => /Ambulant|Non/.test(c));
                const dominantHand = cats.find((c) => /Left|Right/.test(c));
                const baselineAge = getMagnitude(subj, 'AspectAge');
                const loaAge = getMagnitude(subj, 'AspectAgeOfOnset');
                const totalMfm = event.produces?.hasMagnitude?.numericValue;
                const belowAvg = !!event.isCategorizedBy;

                const cells = [
                  event.isIdentifiedBy?.uniqueText ?? '–',
                  cluster ? labelFromId(cluster) : '–',
                  genetic ? labelFromId(genetic) : '–',
                  baselineAge != null ? baselineAge.toFixed(2) : '–',
                  ambulation ? labelFromId(ambulation) : '–',
                  loaAge != null ? loaAge.toFixed(2) : '–',
                  dominantHand ? labelFromId(dominantHand) : '–',
                  totalMfm != null ? String(totalMfm) : '–',
                  belowAvg ? <Badge key="badge" variant="secondary">below</Badge> : '–',
                ];

                return (
                  <tr key={event['@id'] ?? event.isIdentifiedBy?.uniqueText ?? rowIndex}>
                    {COLUMNS.map((col, i) => (
                      <td key={col.key} className={tdClass(col.align)}>
                        {cells[i]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: 24 },
  tableWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
  },
});
