import traverse, { NodePath } from "@babel/traverse";
import { parse, type ParseResult } from "@babel/parser";
import type { BlockStatement, File, StringLiteral } from "@babel/types";
import type { FunctionalExpression } from "../type";
import { extraTestIdFromTitle } from "./testCaseManager";


type HandleNodePath = NodePath<FunctionalExpression | StringLiteral>;

export function isFunctionalExpression(nodePath: NodePath<any>): nodePath is NodePath<FunctionalExpression> {
    return nodePath.isFunctionExpression() || nodePath.isArrowFunctionExpression();
}

export function getNodePathAtOffset(ast: ParseResult<File>, offset: number): HandleNodePath | null {
    let targetNodePath = null;

    traverse(ast, {
        StringLiteral(path) {
            const { start, end } = path.node;
            if (offset >= start! && offset <= end!) {
                targetNodePath = path;
                path.stop();
            }
        },
        ArrowFunctionExpression(path) {
            const { start, end } = path.node;
            if (offset >= start! && offset <= end!) {
                targetNodePath = path;
                path.stop();
            }
        },
        FunctionExpression(path) {
            const { start, end } = path.node;
            if (offset >= start! && offset <= end!) {
                targetNodePath = path;
                path.stop();
            }
        },
    });

    return targetNodePath;
}

export function isLocateInItCallExpress(nodePath: HandleNodePath) {
    const parentPath = nodePath.parentPath;
    if (!parentPath) { return false; }
    return parentPath.isCallExpression() && parentPath.get('callee').isIdentifier({ name: 'it' });
}

export function getCommentLineAtOffset(nodePath: NodePath<FunctionalExpression>, offset: number) {
    const blockStatementPath = nodePath.get('body');
    const leadingCommentNodes = (blockStatementPath.node as BlockStatement).innerComments;
    return leadingCommentNodes?.find(node => {
        return offset >= node.start! && offset <= node.end!;
    });
}

export function getClosestTestCaseId(nodePath: NodePath<FunctionalExpression>) {
    const parentPath = nodePath.parentPath;
    if (!parentPath) { return null; }
    if (!parentPath.isCallExpression()) { return null; }
    const args = parentPath.get('arguments');
    if (!args || args.length === 0) { return null; }
    const arg = args[0];
    if (!arg.isStringLiteral()) { return null; }
    return extraTestIdFromTitle(arg.node.value);
}

export function getClosestFunctionalPath(text: string, offset: number) {
    let targetNodePath: HandleNodePath | null = null;
    const ast = parse(text);
    traverse(ast, {
        ArrowFunctionExpression(path) {
            const { start, end } = path.node;
            if (offset >= start! && offset <= end!) {
                targetNodePath = path;
                path.stop();
            }
        },
        FunctionExpression(path) {
            const { start, end } = path.node;
            if (offset >= start! && offset <= end!) {
                targetNodePath = path;
                path.stop();
            }
        },
    });
}

export function parseDocToAst(doc: string) {
    const ast = parse(doc, {
        sourceType: 'module',
        plugins: ['jsx'],
    });
    return ast;
}