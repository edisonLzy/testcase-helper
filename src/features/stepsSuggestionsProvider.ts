import * as vscode from "vscode";

export function stepsSuggestionsProvider() {
  return vscode.languages.registerCompletionItemProvider(
    { scheme: "file", language: "typescript" },
    {
      provideCompletionItems(document, position) {
        const linePrefix = document
          .lineAt(position)
          .text.substr(0, position.character);
        if (linePrefix.includes("=>")) {
          const commentText = linePrefix.trim();

          const commentItem = new vscode.CompletionItem(
            `// ${commentText}`,
            vscode.CompletionItemKind.Snippet
          );
          commentItem.insertText = new vscode.SnippetString(
            `// ${commentText}\n`
          );

          return [commentItem];
        }

        return undefined;
      },
    },
    "("
  );
}
