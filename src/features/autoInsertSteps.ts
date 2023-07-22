import * as vscode from "vscode";
import { parse } from "@babel/parser";
import generator from "@babel/generator";
import { NodePath } from "@babel/traverse";
import type { BlockStatement } from "@babel/types";
import * as prettier from "prettier";
import { FunctionalExpression, MetaData, Step } from "../type";
import { getNodePathAtOffset, isLocateInItCallExpress } from "../helper";
import {
  splitPrerequisite,
  splitStepDescription,
} from "../helper/testCaseManager";

function indentComment(comment: string) {
  return ` ${comment}`;
}

function getComments(prerequisite: string, steps: Step[]) {
  const comments: string[] = [];

  // prerequisite
  const splitedPrerequisite = splitPrerequisite(prerequisite);
  splitedPrerequisite.forEach((c) => {
    comments.push(c);
  });
  // steps
  steps.forEach((step) => {
    const { title, description } = step;
    comments.push(title);

    const splitedDescription = splitStepDescription(description);
    splitedDescription.forEach((desc) => {
      comments.push(desc);
    });
  });
  return comments.filter(Boolean).map(indentComment);
}

export function autoInsertSteps(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand(
    "extension.autoInsertSteps",
    async (
      metaData: MetaData,
      oldFunctionalPath: NodePath<FunctionalExpression>
    ) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const { prerequisite, steps } = metaData;

      const blockNodePath = oldFunctionalPath.get(
        "body"
      ) as NodePath<BlockStatement>;
      if (blockNodePath.node.body.length !== 0) {
        // 存在内容则什么都不做
        return;
      }
      const comments = getComments(prerequisite, steps);
      comments.forEach((comment) => {
        blockNodePath.addComment("inner", comment, true);
      });
      try {
        const newFunctionBodyText = await prettier.format(
          generator(blockNodePath.node).code,
          {
            parser: "babel",
            semi: false,
          }
        );

        const document = editor.document;
        const position = editor.selection.active;
        const offset = document.offsetAt(position);

        const ast = parse(document.getText());
        const nodePath = getNodePathAtOffset(
          ast,
          offset
        ) as NodePath<FunctionalExpression>;
        if (!isLocateInItCallExpress(nodePath)) {
          return;
        }
        const newFunctionalPath = nodePath.getAllNextSiblings().at(-1);
        if (!newFunctionalPath) {
          return;
        }
        const bodyPath = newFunctionalPath.get(
          "body"
        ) as NodePath<BlockStatement>;

        editor.edit((editBuilder) => {
          const { start, end } = bodyPath.node;
          const startPosition = document.positionAt(start!);
          const endPosition = document.positionAt(end!);
          const range = new vscode.Range(startPosition, endPosition);
          editBuilder.replace(range, newFunctionBodyText);
        });
      } catch (e) {
        console.log(e);
      }
    }
  );
}
