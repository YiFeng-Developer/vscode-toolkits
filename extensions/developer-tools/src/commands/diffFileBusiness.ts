import { workspace, window, QuickPickItem, commands, Uri } from 'vscode';
import * as fse from 'fs-extra';
import * as globby from 'globby';

const rootPath = workspace.rootPath || '';

// 获取 workspace 下所有业态
function getAllBusiness() {
  const businesses = globby.sync(`${rootPath}/mall-*`, { deep: 1, onlyDirectories: true });
  return businesses;
}

async function diffFileBusiness() {
  // 当前文件的 absolute path
  const currentFilePath = window.activeTextEditor?.document.fileName || '';

  // 找出 workspace 所有存在的业态文件夹 absolute path
  const allBusiness = getAllBusiness();

  // 分析出对业态文件夹的 relative path
  let relativePath = '';
  let currentBusiness = ''; // 当前文件所处业态
  allBusiness.find(businessPath => {
    const regResult = new RegExp(businessPath).test(currentFilePath);
    if (regResult) {
      relativePath = currentFilePath.replace(businessPath, '');
      currentBusiness = businessPath;
    }
  });

  const relativeFilename = relativePath.split('.')?.[0] || '';

  // 所有业态文件夹中根据相对路径找到存在相同路径的文件
  const quickPickOptions: QuickPickItem[] = [];

  function addQuickPickOpts(filePath: string) {
    if (filePath !== currentFilePath && fse.existsSync(filePath)) {
      quickPickOptions.push({ label: filePath.replace(rootPath, ''), description: filePath });
    }
  }

  allBusiness.forEach(businessPath => {
    // 所有业态文件夹中根据相对路径找到存在相同路径的文件
    const result = globby.sync(`${businessPath}${relativeFilename}.*`);
    result.forEach((filePath) => { addQuickPickOpts(filePath); });
  });

  const targetPath = (await window.showQuickPick(quickPickOptions, { placeHolder: '请选择要前往的业态' }))?.description || '';

  if (targetPath) {
    commands.executeCommand('vscode.diff', Uri.file(currentFilePath), Uri.file(targetPath));
  }

}

export default diffFileBusiness;
