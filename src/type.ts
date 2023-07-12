import { ArrowFunctionExpression, FunctionExpression } from "@babel/types";

export type RawData = Record<string, string>;

export type CaseId = string;

export type Step =  {
   label: string
   result: string
};

export type MetaData = {
   // case id
   id: CaseId
   // case title
   title: string
   // case prerequisite
   prerequisite: string
   // steps
   steps: Step[]
};

export type MetaDataCollection = Record<CaseId, MetaData>;

export type FunctionalExpression = ArrowFunctionExpression | FunctionExpression;