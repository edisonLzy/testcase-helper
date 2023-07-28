import * as vscode from "vscode";
import { TEST_CASE_MANAGER_KEY } from "../constant";
import {
  getClosestTestCaseId,
  getCommentLineAtOffset,
  getNodePathAtOffset,
  isFunctionalExpression,
  isLocateInItCallExpress,
  parseDocToAst,
} from "../helper";
import { TestCaseManager,matchStepTitle } from "../helper/testCaseManager";

function getClosetStepTitleCommentFromPosition(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  let currentLine = position.line;
  while (currentLine >= 0) {
    const lineText = document.lineAt(currentLine).text.trim();
    if (lineText.startsWith("//") === false) {
      return -1;
    }
    const result = matchStepTitle(lineText);
    if(result){
      return result;
    }    
    currentLine--;  
  }
  return -1;
}

export function stepsSuggestionsProvider(context: vscode.ExtensionContext) {
  return vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "typescript" },
    {
      provideCompletionItems(document, position) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }

        const testCaseManager = context.workspaceState.get<TestCaseManager>(
          TEST_CASE_MANAGER_KEY
        );
        if (!testCaseManager) {
          return;
        }

        // check position in validate range
        const cursorPositionOffset = editor.document.offsetAt(position);
        const ast = parseDocToAst(document.getText());
        const nodePath = getNodePathAtOffset(ast, cursorPositionOffset);
        if (!nodePath) {
          return;
        }
        if (!isLocateInItCallExpress(nodePath)) {
          return;
        }
        if (!isFunctionalExpression(nodePath)) {
          return;
        }

        const testCaseId = getClosestTestCaseId(nodePath);
        if (!testCaseId) {
          return;
        }
        const stepTitle = getClosetStepTitleCommentFromPosition(document,position);
        if(stepTitle === -1){
          return; 
        }

        const testCaseStep = testCaseManager.getCaseStep(testCaseId, stepTitle);

        if (testCaseStep) {
          const completionItem = new vscode.CompletionItem(testCaseStep.title, vscode.CompletionItemKind.Event);
          completionItem.insertText = '';
          completionItem.detail = '预期结果:';
          completionItem.documentation = testCaseStep.expectation;
          return new vscode.CompletionList([completionItem]);
        }
        return undefined;
      },
    },
    ':'
  );
}
