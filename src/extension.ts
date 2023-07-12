import * as vscode from 'vscode';

import { setupTestCaseFile, titleSuggestionsProvider, stepsSuggestionsProvider } from './features';
import { autoInsertSteps } from './features/autoInsertSteps';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(setupTestCaseFile(context));
	context.subscriptions.push(titleSuggestionsProvider(context));
	context.subscriptions.push(stepsSuggestionsProvider(context));
	context.subscriptions.push(autoInsertSteps(context));
}

export function deactivate() {}
