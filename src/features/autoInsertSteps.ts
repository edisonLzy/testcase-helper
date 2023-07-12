import * as vscode from 'vscode';
import { parse } from '@babel/parser';
import generator from '@babel/generator';
import { NodePath } from '@babel/traverse';
import { BlockStatement } from '@babel/types';
import * as prettier from 'prettier';
import { FunctionalExpression, MetaData } from '../type';
import { getNodePathAtOffset, isLocateInItCallExpress } from '../helper';

export function autoInsertSteps(context: vscode.ExtensionContext) {
    return vscode.commands.registerCommand('extension.autoInsertSteps', async (metaData: MetaData, oldFunctionalPath: NodePath<FunctionalExpression>) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }
        
        const { prerequisite, steps } = metaData;

        const comments = [prerequisite, ...steps.map(s => s.label)];
        const blockNodePath = oldFunctionalPath.get('body') as NodePath<BlockStatement>;
        comments.forEach(comment => {
            const isSingleLine = comment.includes('\n') === false;
            blockNodePath.addComment('inner', comment, isSingleLine);
        });
        oldFunctionalPath.set('body', blockNodePath.node);
        const newFunctionText = await prettier.format(generator(oldFunctionalPath.node).code, { parser: 'babel' });

        const document = editor.document;
        const position = editor.selection.active;
        const offset = document.offsetAt(position);

        const ast = parse(document.getText());
        const nodePath = getNodePathAtOffset(ast, offset) as NodePath<FunctionalExpression>;
        if(!isLocateInItCallExpress(nodePath)){return;}; 
        
        const newFunctionalPath = nodePath.getAllNextSiblings().at(-1);
        if(!newFunctionalPath){return;};
        
        editor.edit(editBuilder => {
            const { start, end } = newFunctionalPath.node;
            const startPosition = document.positionAt(start!);
            const endPosition = document.positionAt(end!);
            const range = new vscode.Range(startPosition, endPosition);
            editBuilder.replace(range, newFunctionText);
        });

    });
}