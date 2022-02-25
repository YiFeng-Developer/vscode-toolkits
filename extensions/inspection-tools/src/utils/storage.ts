import { ExtensionContext } from 'vscode';
import { logOutput } from '@vscode-toolkit/common-utils';
import * as path from 'path';
import * as fse from 'fs-extra';

function initStorageFolder(fsPath: string) {
  if (fsPath && !fse.existsSync(fsPath)) {
    logOutput(`Attempting to create local storage folder ${fsPath}`);
    fse.mkdirSync(fsPath, { recursive: true });
  }
}

export function readStorageFile(context: ExtensionContext, fileName: string) {
  const fsPath = context.storageUri?.fsPath || '';
  initStorageFolder(fsPath);

  const cacheFile = path.join(fsPath, fileName);
  if (fse.existsSync(cacheFile)) {
    logOutput(`Found local storage folder ${fsPath}`);

    return fse.readFileSync(cacheFile, 'utf8');
  }

  return '';
}

export function writeStorageFile(context: ExtensionContext, fileName: string, value: any) {
  const fsPath = context.storageUri?.fsPath || '';
  initStorageFolder(fsPath);

  const cacheFile = path.join(fsPath, fileName);
  value && fse.writeFileSync(cacheFile, JSON.stringify(value));
}
