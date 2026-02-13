import { Schema } from "shexj";

/**
 * =============================================================================
 * nemaline_myopathy_gistSchema: ShexJ Schema for nemaline_myopathy_gist
 * =============================================================================
 */
export const nemaline_myopathy_gistSchema: Schema = {
  type: "Schema",
  shapes: [
    {
      id: "https://paediatrics.ox.ac.uk/terms/AssessmentEventShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Determination",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isIdentifiedBy",
              valueExpr: "https://paediatrics.ox.ac.uk/terms/IDShape",
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasParticipant",
              valueExpr: "https://paediatrics.ox.ac.uk/terms/SubjectShape",
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/produces",
              valueExpr: "https://paediatrics.ox.ac.uk/terms/TotalScoreResult",
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasPart",
              valueExpr:
                "https://paediatrics.ox.ac.uk/terms/TaskPerformanceShape",
              min: 5,
              max: 5,
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
              valueExpr: {
                type: "NodeConstraint",
                values: ["https://paediatrics.ox.ac.uk/terms/BelowAverage"],
              },
              min: 0,
              max: 1,
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/SubjectShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Person",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://paediatrics.ox.ac.uk/terms/C1",
                  "https://paediatrics.ox.ac.uk/terms/C2",
                  "https://paediatrics.ox.ac.uk/terms/C3",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://paediatrics.ox.ac.uk/terms/variant1",
                  "https://paediatrics.ox.ac.uk/terms/variant2",
                  "https://paediatrics.ox.ac.uk/terms/variant3",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://paediatrics.ox.ac.uk/terms/Left",
                  "https://paediatrics.ox.ac.uk/terms/Right",
                ],
              },
              min: 0,
              max: 1,
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/isCategorizedBy",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://paediatrics.ox.ac.uk/terms/Ambulant",
                  "https://paediatrics.ox.ac.uk/terms/Non-Ambulant",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
              valueExpr: "https://paediatrics.ox.ac.uk/terms/LoAAgeMagnitude",
              min: 0,
              max: 1,
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
              valueExpr:
                "https://paediatrics.ox.ac.uk/terms/AgeAtAssessmentMagnitude",
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/TaskPerformanceShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Event",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/produces",
              valueExpr:
                "https://paediatrics.ox.ac.uk/terms/TaskPerformanceProduces",
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
              valueExpr:
                "https://paediatrics.ox.ac.uk/terms/TimeOffsetMagnitude",
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/TaskPerformanceProduces",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Content",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
              valueExpr:
                "https://paediatrics.ox.ac.uk/terms/MFMSubScoreMagnitude",
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/TotalScoreResult",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Content",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasMagnitude",
              valueExpr: "https://paediatrics.ox.ac.uk/terms/TotalMFMMagnitude",
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/TotalMFMMagnitude",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Magnitude",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
              valueExpr: {
                type: "NodeConstraint",
                values: ["https://paediatrics.ox.ac.uk/terms/Aspect_TotalMFM"],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#decimal",
              },
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/IDShape",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: ["https://w3id.org/semanticarts/ns/ontology/gist/ID"],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/uniqueText",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#string",
              },
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/AgeAtAssessmentMagnitude",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Magnitude",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
              valueExpr: {
                type: "NodeConstraint",
                values: ["https://paediatrics.ox.ac.uk/terms/Aspect_Age"],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#decimal",
              },
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/LoAAgeMagnitude",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Magnitude",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://paediatrics.ox.ac.uk/terms/Aspect_AgeOfOnset",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#decimal",
              },
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/MFMSubScoreMagnitude",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Magnitude",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://paediatrics.ox.ac.uk/terms/Aspect_MFM_SubScore",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#decimal",
              },
            },
          ],
        },
      },
    },
    {
      id: "https://paediatrics.ox.ac.uk/terms/TimeOffsetMagnitude",
      type: "ShapeDecl",
      shapeExpr: {
        type: "Shape",
        expression: {
          type: "EachOf",
          expressions: [
            {
              type: "TripleConstraint",
              predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://w3id.org/semanticarts/ns/ontology/gist/Magnitude",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/hasAspect",
              valueExpr: {
                type: "NodeConstraint",
                values: [
                  "https://paediatrics.ox.ac.uk/terms/Aspect_TimeOffset",
                ],
              },
            },
            {
              type: "TripleConstraint",
              predicate:
                "https://w3id.org/semanticarts/ns/ontology/gist/numericValue",
              valueExpr: {
                type: "NodeConstraint",
                datatype: "http://www.w3.org/2001/XMLSchema#decimal",
              },
            },
          ],
        },
      },
    },
  ],
};
