import * as vscode from 'vscode';

export function titleSuggestionsProvider() {
  return vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: 'typescript' },
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (linePrefix.includes('it(')) {
          // 
          const idValues = ['id1', 'id2', 'id3']; // Replace with actual values from testcase.meta.json

          const completionItems = idValues.map((id) => {
            const item = new vscode.CompletionItem(id, vscode.CompletionItemKind.Value);
            item.documentation = 'This is an id value from testcase.meta.json';
            item.insertText = new vscode.SnippetString(`
            // 1 
            // 2
            // 3
            `);
            return item;
          });

          return new vscode.CompletionList(completionItems);
        }

        return undefined;
      }
    },
    '('
  );
}