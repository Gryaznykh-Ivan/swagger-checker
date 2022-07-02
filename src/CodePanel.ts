import * as vscode from "vscode";
import jsYaml from "js-yaml"
import { jsonDeepDiffList } from 'json-deep-diff-list';
import { getNonce } from "./getNonce";
import { SidebarProvider } from "./SidebarProvider";
import { DiffJson } from "../types"

export class CodePanel {
    public static currentPanel: CodePanel | undefined;

    public static readonly viewType = "CodePanel";

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (CodePanel.currentPanel) {
            CodePanel.currentPanel._panel.reveal(column);
            CodePanel.currentPanel._update();
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            CodePanel.viewType,
            "Swagger-checker",
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,

                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, "media"),
                    vscode.Uri.joinPath(extensionUri, "out/compiled"),
                ],
            }
        );

        CodePanel.currentPanel = new CodePanel(panel, extensionUri);
    }

    public static kill() {
        CodePanel.currentPanel?.dispose();
        CodePanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        CodePanel.currentPanel = new CodePanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        CodePanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;

        this._panel.webview.html = this._getHtmlForWebview(webview);
        webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "onCodeChanged":
                    const { mCode, sCode } = data.value;

                    try {
                        const mCodeJson: any = jsYaml.load(mCode);
                        const sCodeJson: any = jsYaml.load(sCode);

                        const mFileSize = mCode.split('\n').length;
                        const sFileSize = sCode.split('\n').length;

                        let mFileEndpointsNumber = 0;
                        let sFileEndpointsNumber = 0;
                        let mFileMissEndpointsNumber = 0;
                        let sFileMissEndpointsNumber = 0;
                        let sFileConfusedTypeNumber = 0;

                        if (mCodeJson?.paths) {
                            mFileEndpointsNumber = Object.keys(mCodeJson.paths).length;
                        }

                        if (sCodeJson?.paths) {
                            sFileEndpointsNumber = Object.keys(sCodeJson.paths).length;
                        }

                        if (mCodeJson?.paths && sCodeJson?.paths) {
                            const mPaths = Object.keys(mCodeJson.paths);
                            const sPaths = Object.keys(sCodeJson.paths);

                            mFileMissEndpointsNumber = sPaths.filter(a => !mPaths.includes(a)).length;
                            sFileMissEndpointsNumber = mPaths.filter(a => !sPaths.includes(a)).length;
                        }

                        const diffResult: DiffJson = jsonDeepDiffList(mCodeJson, sCodeJson).reduce((accumulator, current, i) => {
                            const path = current.path.split('.');
                            const key = path[0];

                            accumulator[current.type].push(current);

                            return accumulator;
                        }, { replace: [], add: [], delete: [] });

                        sFileConfusedTypeNumber = diffResult.replace.reduce((accumulator, current) => {
                            if (current.path.split('.').at(-1) === "type") { accumulator += 1; }
                            return accumulator;
                        }, 0);

                        const fileInfoData = { mFileSize, sFileSize, mFileEndpointsNumber, sFileEndpointsNumber, sFileMissEndpointsNumber, mFileMissEndpointsNumber, sFileConfusedTypeNumber }
                        SidebarProvider._view?.webview.postMessage({ type: 'new-data-received', value: fileInfoData });

                        if (mCodeJson && sCodeJson) {
                            webview.postMessage({ type: 'draw', value: diffResult });
                        }
                    } catch (e) {
                        console.log(e);
                        vscode.window.showErrorMessage("One or both file descrpton error");
                    }
                    break;
                case "onInfo": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case "onError": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
        );

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/codepanel.js")
        );
        const styleMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/codepanel.css")
        );
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <style>
                    body { padding: 0 !important; }

                    .ace-added-highlight {
                        position:absolute;
                        z-index:20;
                        background-color:#04ff0038;
                    }

                    .ace-deleted-highlight {
                        position:absolute;
                        z-index:20;
                        background-color:#ff000038;
                    }

                    .ace-replaced-highlight {
                        position:absolute;
                        z-index:20;
                        background-color:#ffffff38;
                    }
                </style>
                <script nonce="${nonce}">
                    const tsvscode = acquireVsCodeApi();
                </script>
            </head>
            <body>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}