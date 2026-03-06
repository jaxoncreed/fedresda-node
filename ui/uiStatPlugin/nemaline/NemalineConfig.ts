import { ResourceViewConfig } from 'linked-data-browser';
import { Stethoscope } from 'lucide-react-native';
import { NemalineView } from './NemalineView';
import { AssessmentEventShapeType } from '../../shared/schemas';

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const GIST_DETERMINATION = 'https://w3id.org/semanticarts/ns/ontology/gist/Determination';

export const NemalineConfig: ResourceViewConfig = {
  name: 'nemaline',
  displayName: 'Nemaline Assessments',
  displayIcon: Stethoscope,
  view: NemalineView,
  canDisplay: (_targetUri, targetResource, dataset) => {
    if (targetResource?.type !== 'SolidLeaf') return false;
    if (!targetResource.isDataResource?.()) return false;
    const events = dataset
      .usingType(AssessmentEventShapeType)
      .matchSubject(RDF_TYPE, GIST_DETERMINATION);
    const count = events?.size ?? events?.toArray?.()?.length ?? 0;
    return count > 0;
  },
};
