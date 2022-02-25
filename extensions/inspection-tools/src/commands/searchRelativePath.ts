import { commands, workspace } from 'vscode';
import { FileItem } from '../views/items/file-item';
import { readTsConfig } from '../utils';

function removeExtension(path: string) {
  return path.substring(0, path.lastIndexOf(".")) || path;
}

function searchRelativePath(fileItem: FileItem) {
  const { file: { fullPath } } = fileItem;
  const rootPath = workspace.rootPath || '';
  const config = readTsConfig();
  const resolveModule = config?.compilerOptions?.paths['*'];
  const searchRegs: string[] = [];
  resolveModule.forEach((module: string) => {
    const result = removeExtension(fullPath).match(new RegExp(`${rootPath}\/${module.replace('*', '')}(.*)(\/index){0,1}`));
    result?.[1] && searchRegs.push(`['|"]${result[1]}['|"]`);
  });

  commands.executeCommand('workbench.action.findInFiles', {
    query: searchRegs.join('|'),
    isRegex: true,
    triggerSearch: true,
    filesToExclude: 'node_modules/'
  }).then((res) => {
  });
}

export default searchRelativePath;
