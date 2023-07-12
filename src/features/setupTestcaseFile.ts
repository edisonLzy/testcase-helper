import * as vscode from "vscode";
import * as fs from "fs-extra";
import * as os from "node:os";
import * as path from "node:path";
import { TEST_CASE_MANAGER_KEY as TEST_CASE_MANAGER_KEY } from "../constant";
import { TestCaseManager } from '../helper/testCaseManager';

export function setupTestCaseFile(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand(
    "extension.setupTestCaseFile",
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

        const testCaseManager = TestCaseManager.create(filePath);
        const metaData = testCaseManager.getMetaDataCollection();

        context.workspaceState.update(TEST_CASE_MANAGER_KEY, testCaseManager);

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
