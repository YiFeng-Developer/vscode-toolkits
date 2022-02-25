import { Uri, workspace } from "vscode";
import * as fse from 'fs-extra';
import Config from '../core/config';
import * as ts from 'typescript';

export function readTsConfig() {
  const rootPath = workspace.rootPath || '';
  const configFile = ts.readConfigFile(`${rootPath}/tsconfig.json`, ts.sys.readFile);

  return configFile?.config || {};
}

export function isOriginFile(uri: Uri): Boolean {
  const { path } = uri;

  const rootPath = workspace.rootPath || '';

  return path.startsWith(`${rootPath}/${Config.getConfig('originDirPath')}`);
}

export function hasOriginFileReDevelop(uri: Uri): Boolean {
  const { path } = uri;

  if (fse.statSync(path).isDirectory()) {
    return false;
  }

  const rootPath = workspace.rootPath || '';

  const relativePath = path.replace(`${rootPath}/${Config.getConfig('originDirPath')}`, '');

  const isExist = fse.existsSync(`${rootPath}/${relativePath}`);

  return isExist;
}
