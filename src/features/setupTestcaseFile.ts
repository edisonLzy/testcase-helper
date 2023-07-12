import * as vscode from "vscode";
import * as xlsx from "xlsx";
import * as fs from "fs-extra";
import * as os from "node:os";
import * as path from "node:path";

import { MetaData, MetaDataCollection, RawData } from "../type";

export function parseTestCaseFile(filePath: string) {

  return [];
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);
  return jsonData as RawData[];
}

export function convertToMetaData(rawData: RawData[]): MetaDataCollection {
  //
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
      prerequisite,
      // TODO
      steps: [steps],
      results: [results],
    };
  };

  return rawData.reduce<MetaDataCollection>((acc, cur) => {
    const { ID: id } = cur;
    acc[id] = processSingleRow(cur);
    return acc;
  }, {});
}

export function setupTestCaseFile() {
  return vscode.commands.registerCommand(
    "extension.setupTestcaseFile",
    async () => {
      const fileUris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          "Excel Files": ["xlsx"],
        },
      });

      if (fileUris && fileUris.length > 0) {
        const filePath = fileUris[0].fsPath;
        const fileData = parseTestCaseFile(filePath);

        const metaData = convertToMetaData(fileData);

        const homeDir = os.homedir();
        const outputPath = path.join(homeDir, "testCase.meta.json");
        await fs.ensureFile(outputPath);
        await fs.writeJson(outputPath, metaData);

        vscode.window.showInformationMessage(`TestCase file setup complete!
        the meta data file at ${outputPath}
        `);
      }
    }
  );
}
