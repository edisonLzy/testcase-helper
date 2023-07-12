import * as xlsx from "xlsx";
import * as fs from 'fs-extra';
import { MetaData, MetaDataCollection, RawData } from "../type";


export function extraTestIdFromTitle(title: string) {
    const regex = /^([A-Z]\d+).*$/;
    const match = title.match(regex);
    return match ? match[1] : '';
  }
  
function normalizedValue(v:string){
    return v.replace(/\n$/, '');
}


function parseTestCaseFile(filePath: string) {
    
    const buffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    return jsonData as RawData[];
}

function buildStep(steps: string, results: string) {
    const stepList = steps.split('#').filter(Boolean);
    const resultList = results.split('#').filter(Boolean);
    return stepList.map((s, idx) => {
        return {
            label: normalizedValue(s),
            result: normalizedValue(resultList[idx])
        };
    });
}

export function buildPrerequisite(prerequisite: string){
    return '前置条件: \n' + normalizedValue(prerequisite);
}

function convertToMetaData(rawData: RawData[]): MetaDataCollection {
    const processSingleRow = (row: RawData): MetaData => {
        const {
            ID: id,
            用例名称: caseName,
            优先级: priority,
            前置条件: prerequisite,
            步骤描述: steps,
            预期结果: results,
        } = row;

        return {
            id,
            title: `${id}(${priority}): ${caseName}`,
            prerequisite: buildPrerequisite(prerequisite),
            steps: buildStep(steps, results)
        };
    };

    return rawData.reduce<MetaDataCollection>((acc, cur) => {
        const { ID: id } = cur;
        acc[id] = processSingleRow(cur);
        return acc;
    }, {});
}


export class TestCaseManager {

    static instance: TestCaseManager;

    static create(filePath: string) {
        if (TestCaseManager.instance) { return TestCaseManager.instance; }
        return new TestCaseManager(filePath);
    }

    private _metaDataCollection: MetaDataCollection;

    private constructor(filePath: string) {
        const fileData = parseTestCaseFile(filePath);
        this._metaDataCollection = convertToMetaData(fileData);
    }

    getMetaData(id: string){
        return this._metaDataCollection[id];
    }
    
    getMetaDataCollection() {
        return this._metaDataCollection;
    }

    getCaseStep(id: string, label: string) {

        const metaData = this._metaDataCollection[id];
        if (!metaData) { return; }

        return metaData.steps.find(step => {
            const { label: stepLabel } = step;
            return stepLabel === label;
        });
    }
}