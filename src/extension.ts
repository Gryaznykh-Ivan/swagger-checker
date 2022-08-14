import * as vscode from 'vscode';
import { CodePanel } from './codepanel';
import { SidebarProvider } from './sidebarprovider';

export function activate(ctx: vscode.ExtensionContext) {

	const sidebarProvider = new SidebarProvider(ctx.extensionUri);
	ctx.subscriptions.push(
		vscode.window.registerWebviewViewProvider("swagger-checker-sidebar", sidebarProvider)
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand("swagger-checker.openCodePanel", () => {
			CodePanel.createOrShow(ctx.extensionUri, null);
		})
	);

	ctx.subscriptions.push(
		vscode.commands.registerCommand("swagger-checker.refresh", async () => {
			await vscode.commands.executeCommand("workbench.action.closeSidebar");
			await vscode.commands.executeCommand(
				"workbench.view.extension.swagger-checker-sidebar-view"
			);
		})
	);
}

export function deactivate() { }
