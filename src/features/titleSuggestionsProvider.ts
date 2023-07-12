import * as vscode from 'vscode';
import { TEST_CASE_MANAGER_KEY } from '../constant';
import { TestCaseManager } from '../helper/testCaseManager';
import { getNodePathAtOffset, isFunctionalExpression, isLocateInItCallExpress, parseDocToAst } from '../helper';

export function titleSuggestionsProvider(context: vscode.ExtensionContext) {

  return vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: 'typescript' },
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; };

        const testCaseManager = context.workspaceState.get<TestCaseManager | undefined>(TEST_CASE_MANAGER_KEY);
        if (!testCaseManager) { return; };

        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (linePrefix.includes('it(')) {

          const document = editor.document;
          const positionOffset = document.offsetAt(position);
          const ast = parseDocToAst(document.getText());
          const nodePath = getNodePathAtOffset(ast, positionOffset);

          if(nodePath && isLocateInItCallExpress(nodePath)){

            const targetNodePath = nodePath.getAllNextSiblings().find(isFunctionalExpression);

            const collection = testCaseManager.getMetaDataCollection();
            const completionItems = Object.entries(collection).map(([id, metaData]) => {
              const item = new vscode.CompletionItem(metaData.title, vscode.CompletionItemKind.Value);
              item.documentation = metaData.title;
              item.command = {
                title: '',
                command: 'extension.autoInsertSteps',
                arguments: [metaData, targetNodePath],
              };
              return item;
            });
  
            return new vscode.CompletionList(completionItems);
          }
        }

        return undefined;
      }
    },
    '('
  );
}