import * as vscode from 'vscode';
import { findingDetailWebview } from './FindingDetail';
import { Finding } from "../../../domain/model/Finding";

let vulnPanels: Map<string, vscode.WebviewPanel> = new Map();

export function showVulnContextWebview(finding: Finding): void {
    const panelId = `vulnContext-${finding.getId()}-${new Date().getTime()}`;

    if (vulnPanels.has(panelId)) {
        const existingPanel = vulnPanels.get(panelId);
        existingPanel?.reveal(vscode.ViewColumn.Beside);
    } else {
        const vulnPanel = vscode.window.createWebviewPanel(
            'vulnContext',
            `Finding: ${finding.getId()}`,
            vscode.ViewColumn.Beside,
            { enableScripts: true, retainContextWhenHidden: true }
        );
        vulnPanel.webview.html = findingDetailWebview(finding);

        vulnPanel.onDidDispose(() => {
            vulnPanels.delete(panelId);
        });

        vulnPanels.set(panelId, vulnPanel);
    }
}

// Generic alias for all practices
export const showGeneralFindingWebview = showVulnContextWebview;

export function disposeVulnPanel(): void {
    vulnPanels.forEach(panel => {
        panel.dispose();
    });
    vulnPanels.clear();
}

