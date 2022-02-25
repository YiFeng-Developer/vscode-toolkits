import { EventEmitter, Event, Uri, TreeDataProvider, TreeItem } from 'vscode';
import { Core } from '../core/workspace';
import { FileItem } from './items/file-item';
import { File } from '../ts-unused-exports/types';

export default class ProjectProvider implements TreeDataProvider<FileItem | TreeItem> {
  private _onDidChangeTreeData: EventEmitter<FileItem | undefined> = new EventEmitter<FileItem | undefined>();

  public readonly onDidChangeTreeData: Event<FileItem | undefined> = this._onDidChangeTreeData.event;

  private cacheFiles: File[] = [];

  constructor(private core: Core) {
    this.refresh();
  }

  public refresh = () => {
    this.cacheFiles = this.getFiles();
  };

  private getFiles(): File[] {
    const files = this.core.getFilesData();

    if (files.length === 0) {
      return [];
    }

    return files;
  }

  public getTreeItem(element: FileItem): FileItem {
    return element;
  }

  public getChildren(element?: FileItem): Promise<FileItem[] | TreeItem[]> {
    if (element?.children) {
      return Promise.resolve(element?.children);
    }

    return new Promise((resolve) => {
      const children = this.cacheFiles.map((file) => {
        const uri = Uri.file(file.fullPath);

        return new FileItem(uri, file);
      });

      resolve(children);
    });
  }
}
