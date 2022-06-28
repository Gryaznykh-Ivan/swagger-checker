import * as vscode from 'vscode';
import { CodePanel } from './CodePanel';
import { SidebarProvider } from './SidebarProvider';

export function activate(ctx: vscode.ExtensionContext) {
	
	const sidebarProvider = new SidebarProvider(ctx.extensionUri);
	ctx.subscriptions.push(
	  vscode.window.registerWebviewViewProvider("swagger-checker-sidebar", sidebarProvider)
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand("swagger-checker.openCodePanel", () => {
			CodePanel.createOrShow(ctx.extensionUri);
		})
	);
}

export function deactivate() {}
