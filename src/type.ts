export type RawData = Record<string, string>

export type CaseId = string

export type MetaData = {
   // case id
   id: CaseId
   // case title
   title: string
   // case prerequisite
   prerequisite: string
   // steps
   steps: string[]
   // expected results
   results: string[]
}

export type MetaDataCollection = Record<CaseId, MetaData>