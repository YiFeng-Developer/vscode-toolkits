import { ExtensionContext, commands, workspace, window } from 'vscode';
import removeCompAndRef from './commands/removeCompAndRef';
import searchRelativePath from './commands/searchRelativePath';
import { Core } from './core/workspace';

import ProjectProvider from './views/ProjectProvider';

import { logOutput } from '@vscode-toolkit/common-utils';
import { readStorageFile } from './utils/storage';

export function activate(context: ExtensionContext) {
  logOutput('Congratulations, your extension "developer-tools" is now active!');

  // 初始化缓存文件夹
  const localCache = readStorageFile(context, 'project-overview.json');
  localCache && context.workspaceState.update('localCache', localCache);

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders?.length > 0) {
    const cores = workspaceFolders.map((wsf) => new Core(wsf, context));

    // window.registerTreeDataProvider('project-overview.overview', new OverviewProvider(cores));
    const projectProvider = new ProjectProvider(cores[0]);
    window.registerTreeDataProvider('project-overview.unusedExport', projectProvider);
  }

  commands.registerCommand('developer-tool.re-develop-file', removeCompAndRef);

  commands.registerCommand('project-overview.unusedExport.searchRelativePath', searchRelativePath);
}

// this method is called when your extension is deactivated
export function deactivate() {}
