import * as vscode from "vscode";
import { ParseResult } from '@babel/parser';
import {  TEST_CASE_MANAGER_KEY } from '../constant';
import { getClosestTestCaseId, getCommentLineAtOffset, getNodePathAtOffset, isFunctionalExpression, isLocateInItCallExpress, parseDocToAst } from "../helper";
import { TestCaseManager } from "../helper/testCaseManager";

export function stepsSuggestionsProvider(context: vscode.ExtensionContext) {
  return vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "typescript" },
    {
      provideCompletionItems(document, position) {

        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const testCaseManager = context.workspaceState.get<TestCaseManager>(TEST_CASE_MANAGER_KEY);
        if(!testCaseManager) {return;}; 

        const cursorPositionOffset = editor.document.offsetAt(position);
        const ast = parseDocToAst(document.getText());
        const nodePath = getNodePathAtOffset(ast, cursorPositionOffset);
        if (!nodePath) { return; }

        if (!isLocateInItCallExpress(nodePath)) { return; }
        if (!isFunctionalExpression(nodePath)) { return; }

        const commentLineNode = getCommentLineAtOffset(nodePath, cursorPositionOffset);
        if (!commentLineNode) { return; };

        const testCaseId = getClosestTestCaseId(nodePath);
        if(!testCaseId) {return;}; 
        
        const { value } = commentLineNode;
        const testCaseStep = testCaseManager.getCaseStep(testCaseId,value);
        
        if(testCaseStep){
          const completionItem = new vscode.CompletionItem(testCaseStep.result, vscode.CompletionItemKind.Value);
          return new vscode.CompletionList([completionItem]);
        }
        return undefined;
      },
    }
  );
}
