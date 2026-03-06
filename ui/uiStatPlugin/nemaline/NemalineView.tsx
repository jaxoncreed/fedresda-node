import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  LoadingBar,
  useViewContext,
} from 'linked-data-browser';
import { useResource, useMatchSubject } from '@ldo/solid-react';
import { AssessmentEventShapeType } from '../../shared/schemas';
import type { AssessmentEvent, Subject } from '../../shared/schemas';

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const GIST_DETERMINATION = 'https://w3id.org/semanticarts/ns/ontology/gist/Determination';

/** Get the aspect @id from a magnitude (hasAspect can be a single object or an LdSet). */
function getAspectId(m: unknown): string | undefined {
  const hasAspect = (m as { hasAspect?: { '@id'?: string } | { toArray?: () => Array<{ '@id'?: string }> } }).hasAspect;
  if (hasAspect == null) return undefined;
  const first = typeof (hasAspect as { toArray?: () => unknown[] }).toArray === 'function'
    ? (hasAspect as { toArray: () => Array<{ '@id'?: string }> }).toArray()?.[0]
    : (hasAspect as { '@id'?: string });
  return (first as { '@id'?: string })?.['@id'];
}

/** Extract a single magnitude value by aspect from Subject.hasMagnitude. */
function getMagnitude(
  subject: Subject,
  aspectId: 'AspectAge' | 'AspectAgeOfOnset',
): number | undefined {
  const mags = subject.hasMagnitude;
  if (!mags) return undefined;
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

/** Get category IDs from Subject.isCategorizedBy. */
function getCategories(subject: Subject): string[] {
  const cats = subject.isCategorizedBy;
  if (!cats) return [];
  const arr = cats.toArray?.() ?? (cats as Iterable<{ '@id'?: string }>[]);
  return arr
    .map((c) => c?.['@id'])
    .filter((id): id is string => typeof id === 'string');
}

/** Extract display label from category ID (handles full URLs). */
function labelFromId(id: string): string {
  const last = id.split('/').pop() ?? id;
  return last.replace(/-/g, ' ');
}

type Align = 'left' | 'right' | 'center';

/** Column definitions: widths chosen so header labels stay on one line; alignment matches data. */
const COLUMNS: ReadonlyArray<{
  key: string;
  label: string;
  width: number;
  align: Align;
}> = [
  { key: 'id', label: 'ID', width: 52, align: 'right' },
  { key: 'cluster', label: 'Cluster', width: 72, align: 'left' },
  { key: 'genetic', label: 'Genetic group', width: 112, align: 'left' },
  { key: 'baselineAge', label: 'Baseline age', width: 104, align: 'right' },
  { key: 'ambulation', label: 'Ambulation', width: 104, align: 'left' },
  { key: 'loaAge', label: 'LoA age', width: 80, align: 'right' },
  { key: 'dominantHand', label: 'Dominant hand', width: 112, align: 'left' },
  { key: 'totalMfm', label: 'Total MFM', width: 88, align: 'right' },
  { key: 'belowAvg', label: 'Below avg.', width: 92, align: 'center' },
];

const cellStyle = (width: number, align: Align): { minWidth: number; width: number; alignItems: 'flex-start' | 'flex-end' | 'center'; justifyContent: 'flex-start' | 'flex-end' | 'center' } => ({
  minWidth: width,
  width,
  alignItems: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
  justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
});

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

  if (!targetUri || !resource) {
    return null;
  }

  if (resource.type === 'InvalidIdentifierResource') {
    return (
      <View style={styles.container}>
        <Text>Invalid resource.</Text>
      </View>
    );
  }

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
          <Table style={styles.table}>
            <TableHeader style={styles.tableHeader}>
              <TableRow style={styles.headerRow}>
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    style={[cellStyle(col.width, col.align), styles.tableHead]}
                  >
                    <Text variant="label" size="sm" numberOfLines={1} style={styles.headerLabel}>
                      {col.label}
                    </Text>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody style={styles.tableBody}>
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
                  belowAvg ? <Badge variant="secondary" style={styles.badge}>below</Badge> : '–',
                ];

                return (
                  <TableRow
                    key={event['@id'] ?? event.isIdentifiedBy?.uniqueText ?? rowIndex}
                    style={[styles.bodyRow, rowIndex % 2 === 1 && styles.bodyRowStriped]}
                  >
                    {COLUMNS.map((col, i) => (
                      <TableCell
                        key={col.key}
                        style={[cellStyle(col.width, col.align), styles.tableCell]}
                      >
                        {typeof cells[i] === 'string' ? (
                          <Text variant="default" size="sm" style={styles.cellText}>
                            {cells[i]}
                          </Text>
                        ) : (
                          cells[i]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 24,
  },
  tableWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
    alignSelf: 'flex-start',
  },
  table: {
    width: '100%',
    flex: 0,
    flexGrow: 0,
  },
  tableHeader: {
    backgroundColor: 'hsl(var(--muted))',
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
  },
  headerRow: {
    borderBottomWidth: 0,
  },
  tableHead: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  tableBody: {
    borderBottomWidth: 0,
    flex: 0,
    flexGrow: 0,
  },
  headerLabel: {
    fontWeight: '600',
  },
  bodyRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'hsl(var(--border))',
  },
  bodyRowStriped: {
    backgroundColor: 'hsl(var(--muted) / 0.35)',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  cellText: {
    fontSize: 13,
  },
  badge: {
    alignSelf: 'center',
  },
});
