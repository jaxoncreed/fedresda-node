import {
  createLdoDataset,
  toTurtle,
  set,
} from '@ldo/ldo';
import { SolidContainer, SolidLeafSlug } from '@ldo/connected-solid';
import { Stethoscope } from 'lucide-react-native';
import { ResourceCreatorConfig } from 'linked-data-browser';
import { AssessmentEventShapeType } from '../.ldo/nemaline_myopathy_gist.shapeTypes';
import type {
  AssessmentEvent,
  Subject,
  TaskPerformance,
  TaskPerformanceProduces,
  TotalScoreResult,
  TotalMFMMagnitude,
  ID,
  AgeAtAssessmentMagnitude,
  LoAAgeMagnitude,
  MFMSubScoreMagnitude,
  TimeOffsetMagnitude,
} from '../.ldo/nemaline_myopathy_gist.typings';

/** Basename of a path or file name (handles forward slashes). */
function basename(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  return lastSlash === -1 ? path : path.slice(lastSlash + 1);
}

/** Parse CSV text into rows (arrays of column values). */
function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(',').map((c) => c.trim()));
}

/** Parse a numeric cell; returns NaN for "NA" or empty. */
function parseNum(s: string): number {
  const t = s?.trim() ?? '';
  if (t === '' || t.toUpperCase() === 'NA') return NaN;
  return Number(t);
}

/** Build an AssessmentEvent LDO from a CSV row. */
function rowToAssessmentEvent(
  row: string[],
  baseUri: string,
): Omit<AssessmentEvent, '@context'> {
  // CSV columns: row#, Id, Cluster, Baseline_Age, Genetic_Group, Baseline_loA_status,
  // LoA Age, Time_V1-5, MFM_V1-5, Dominant hand, total MFM, Below average
  const id = row[1] ?? '';
  const cluster = row[2] ?? '';
  const baselineAge = parseNum(row[3]);
  const geneticGroup = row[4] ?? '';
  const loaStatus = row[5] ?? '';
  const loaAge = parseNum(row[6]);
  const timeV1 = parseNum(row[7]);
  const timeV2 = parseNum(row[8]);
  const timeV3 = parseNum(row[9]);
  const timeV4 = parseNum(row[10]);
  const timeV5 = parseNum(row[11]);
  const mfmV1 = parseNum(row[12]);
  const mfmV2 = parseNum(row[13]);
  const mfmV3 = parseNum(row[14]);
  const mfmV4 = parseNum(row[15]);
  const mfmV5 = parseNum(row[16]);
  const dominantHand = row[17]?.trim() ?? '';
  const totalMfm = parseNum(row[18]);
  const belowAverage = (row[19] ?? '').toLowerCase();

  const eventUri = `${baseUri}#assessment-${id}`;
  const subjectUri = `${baseUri}#subject-${id}`;
  const idUri = `${baseUri}#id-${id}`;
  const totalResultUri = `${baseUri}#total-result-${id}`;

  const subjectCategories: Subject['isCategorizedBy'] = set(
    { '@id': cluster as 'C1' | 'C2' | 'C3' },
    { '@id': geneticGroup as 'variant1' | 'variant2' | 'variant3' },
    {
      '@id': loaStatus === 'Ambulant' ? 'Ambulant' : ('NonAmbulant' as const),
    },
  );
  if (dominantHand === 'Left' || dominantHand === 'Right') {
    subjectCategories.add({ '@id': dominantHand });
  }

  const subjectMagnitudes: Subject['hasMagnitude'] = set(
    {
      type: set({ '@id': 'Magnitude' as const }),
      hasAspect: { '@id': 'AspectAge' },
      numericValue: baselineAge,
    } as AgeAtAssessmentMagnitude,
  );
  if (!Number.isNaN(loaAge)) {
    subjectMagnitudes.add({
      type: set({ '@id': 'Magnitude' as const }),
      hasAspect: { '@id': 'AspectAgeOfOnset' },
      numericValue: loaAge,
    } as LoAAgeMagnitude);
  }

  const subject: Subject = {
    '@id': subjectUri,
    type: set({ '@id': 'Person' }),
    isCategorizedBy: subjectCategories,
    hasMagnitude: subjectMagnitudes,
  };

  const taskPerf = (
    time: number,
    mfm: number,
    idx: number,
  ): TaskPerformance => ({
    type: set({ '@id': 'Event' }),
    produces: {
      type: set({ '@id': 'Content' }),
      hasMagnitude: {
        type: set({ '@id': 'Magnitude' }),
        hasAspect: { '@id': 'AspectMFMSubScore' },
        numericValue: Number.isNaN(mfm) ? 0 : mfm,
      } as MFMSubScoreMagnitude,
    } as TaskPerformanceProduces,
    hasMagnitude: {
      type: set({ '@id': 'Magnitude' }),
      hasAspect: { '@id': 'AspectTimeOffset' },
      numericValue: Number.isNaN(time) ? 0 : time,
    } as TimeOffsetMagnitude,
  });

  const hasPart = set<TaskPerformance>(
    taskPerf(timeV1, mfmV1, 1),
    taskPerf(timeV2, mfmV2, 2),
    taskPerf(timeV3, mfmV3, 3),
    taskPerf(timeV4, mfmV4, 4),
    taskPerf(timeV5, mfmV5, 5),
  );

  const event: Omit<AssessmentEvent, '@context'> = {
    '@id': eventUri,
    type: set({ '@id': 'Determination' }),
    isIdentifiedBy: {
      '@id': idUri,
      type: set({ '@id': 'ID' }),
      uniqueText: id,
    } as ID,
    hasParticipant: subject,
    produces: {
      '@id': totalResultUri,
      type: set({ '@id': 'Content' }),
      hasMagnitude: {
        type: set({ '@id': 'Magnitude' }),
        hasAspect: { '@id': 'AspectTotalMFM' },
        numericValue: Number.isNaN(totalMfm) ? 0 : totalMfm,
      } as TotalMFMMagnitude,
    } as TotalScoreResult,
    hasPart,
  };

  if (belowAverage === 'below') {
    event.isCategorizedBy = { '@id': 'BelowAverage' };
  }

  return event;
}

export const NemalineCsvResourceCreator: ResourceCreatorConfig = {
  name: 'nemalineCsv',
  displayName: 'Nemaline CSV Upload',
  displayIcon: Stethoscope,
  canCreate: (container): container is SolidContainer =>
    container.type === 'SolidContainer',
  create: async ({ container, createUtils }) => {
    if (!createUtils.promptFile) {
      createUtils.toast('File picker is not available.', { title: 'Error' });
      return;
    }
    createUtils.loadingMessage('Choosing file…');
    const file = await createUtils.promptFile({
      title: 'Upload Nemaline CSV',
      accept: 'text/csv,.csv',
    });
    if (!file) return;

    createUtils.loadingMessage('Reading CSV…');
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) {
      createUtils.toast('CSV must have a header row and at least one data row.', {
        title: 'Error',
      });
      return;
    }

    const header = rows[0];
    const dataRows = rows.slice(1).filter((row) => row.some((c) => c.trim()));

    createUtils.loadingMessage(`Converting ${dataRows.length} rows to RDF…`);

    const baseName = basename(file.name).replace(/\.csv$/i, '');
    const slug = `${baseName}.ttl` as SolidLeafSlug;
    const baseUri = `${container.uri}${slug}`;

    const ldoDataset = createLdoDataset();
    let lastEvent: AssessmentEvent | undefined;

    for (const row of dataRows) {
      const eventData = rowToAssessmentEvent(row, baseUri);
      lastEvent = ldoDataset
        .usingType(AssessmentEventShapeType)
        .fromJson(eventData as AssessmentEvent);
    }

    if (!lastEvent) {
      createUtils.toast('No valid data rows to convert.', { title: 'Error' });
      return;
    }

    createUtils.loadingMessage(`Uploading ${slug}…`);
    const turtle = await toTurtle(lastEvent);
    const blob = new Blob([turtle], { type: 'text/turtle' });

    const result = await container.uploadChildAndOverwrite(
      slug,
      blob,
      'text/turtle',
    );

    if (result.isError) {
      createUtils.toast(result.message, { title: 'Error' });
    } else {
      createUtils.toast(`${slug} uploaded (${dataRows.length} assessments).`);
    }
  },
};
