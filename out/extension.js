'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = require("vscode");
function transposeArroundDot(text) {
    const parts = text.split('.');
    const first = parts[0];
    parts[0] = parts[1];
    parts[1] = first;
    return parts.join('.');
}
function transposeArroundUppercase(text) {
    const upperRegex = /[A-Z]/;
    let index = null;
    for (let i = 1; i < text.length; ++i) {
        if (upperRegex.test(text[i])) {
            index = i;
            break;
        }
    }
    if (index) {
        const first = text.slice(0, index);
        const last = text.slice(index);
        return last + first;
    }
    else {
        return text;
    }
}
function getCharBeforeAndAfterCursor(cursor) {
    const beforePosition = cursor.translate(0, -1); // Position before the cursor
    const afterPosition = cursor.translate(0, 1); // Position after the cursor
    const beforeRange = new vscode.Range(beforePosition, cursor);
    const afterRange = new vscode.Range(cursor, afterPosition);
    return [beforeRange, afterRange];
}
function activate(context) {
    const transposeSelectionDisposable = vscode.commands.registerCommand('extension.transposeSelection', async function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selections = editor.selections;
            await editor.edit((editorBuild) => {
                if (selections.length > 0) {
                    for (let i = 0; i < selections.length; ++i) {
                        if (document.getText(selections[i]).length > 0) {
                            const text = document.getText(selections[i]);
                            if (text.includes('.')) {
                                editorBuild.replace(selections[i], transposeArroundDot(text));
                            }
                            else {
                                editorBuild.replace(selections[i], transposeArroundUppercase(text));
                            }
                        }
                        else {
                            const cursorPos = selections[i].anchor;
                            const textRange = document.getWordRangeAtPosition(cursorPos);
                            if (textRange) {
                                const text = document.getText(textRange);
                                editorBuild.replace(textRange, transposeArroundUppercase(text));
                            }
                        }
                    }
                }
            });
        }
    });
    const transposeCharacter = vscode.commands.registerCommand('extension.transposeCharacter', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selections = editor.selections;
            editor.edit((editBuilder) => {
                if (selections.length > 0) {
                    for (let i = 0; i < selections.length; ++i) {
                        const cursor = selections[i].active;
                        if (cursor.character == 0 ||
                            cursor.character ==
                                document.lineAt(cursor.line).range.end.character) {
                            continue;
                        }
                        const [beforeRange, afterRange] = getCharBeforeAndAfterCursor(cursor);
                        const beforeChar = document.getText(beforeRange); // Character before the cursor
                        const afterChar = document.getText(afterRange); // Character after the cursor
                        editBuilder.replace(beforeRange, afterChar); // Replace the character before with the one after
                        editBuilder.replace(afterRange, beforeChar); // Replace the character after with the one before
                    }
                }
            });
        }
    });
    context.subscriptions.push(transposeSelectionDisposable, transposeCharacter);
}
//# sourceMappingURL=extension.js.map