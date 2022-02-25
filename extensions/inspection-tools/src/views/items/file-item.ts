import { TreeItem, ThemeIcon, Uri, TreeItemCollapsibleState, Selection, Position } from 'vscode';
import { File } from '../../ts-unused-exports/types';

export class FileItem extends TreeItem {
  constructor(uri: Uri, public file: File) {
    super(uri, TreeItemCollapsibleState.Collapsed);

    this.iconPath = ThemeIcon.File;
    this.description = file.fullPath;
  }

  contextValue = 'fileItem';

  get children(): TreeItem[] {
    const { fullPath, path, exports, exportLocations } = this.file;

    return exports.map((rel, i) => {
      const uri = Uri.file(fullPath);
      const item = new TreeItem(rel);
      const { line, character } = exportLocations[i];
      item.description = `L${line}`;
      const exportStart = new Position(line, character);
      item.command = {
        title: '',
        command: 'vscode.open',
        arguments: [
          uri,
          { selection: new Selection(exportStart, exportStart) }
        ]
      };
      return item;
    });
  }
}
