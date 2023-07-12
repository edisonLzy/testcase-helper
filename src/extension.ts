import * as vscode from 'vscode';
import { setupTestCaseFile, titleSuggestionsProvider, stepsSuggestionsProvider } from './features'

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(setupTestCaseFile());
	context.subscriptions.push(titleSuggestionsProvider());
	context.subscriptions.push(stepsSuggestionsProvider());
}

export function deactivate() {}
