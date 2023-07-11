import * as vscode from 'vscode';
import { setupTestcaseFile, titleSuggestionsProvider, stepsSuggestionsProvider } from './features'

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(setupTestcaseFile());
	context.subscriptions.push(titleSuggestionsProvider());
	context.subscriptions.push(stepsSuggestionsProvider());
}

export function deactivate() {}
