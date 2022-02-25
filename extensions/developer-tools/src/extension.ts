import { ExtensionContext, commands } from 'vscode';
import diffFileBusiness from './commands/diffFileBusiness';

import { logOutput } from '@vscode-toolkit/common-utils';

export function activate(context: ExtensionContext) {
  logOutput('Congratulations, your extension "developer-tools" is now active!');

  commands.registerCommand('developer-tool.diff-file-business', diffFileBusiness);
}

// this method is called when your extension is deactivated
export function deactivate() {}
