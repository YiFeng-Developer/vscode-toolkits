import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceFolder, workspace, window, TextEditor, TextDocument, Selection, commands, ExtensionContext } from 'vscode';
import { OverviewContext } from '../overviewContext';
import { loadTsConfig } from '../ts-unused-exports/app';
import { File, LocationInFile } from '../ts-unused-exports/types';
import parseFiles from '../ts-unused-exports/parser';
import analyze from '../ts-unused-exports/analyzer';
// import { app } from '../unused-exports/app';
import { writeStorageFile } from '../utils/storage';

const cacheFiles: Record<string, File[]> = {};
const listeners: Record<string, Array<() => void>> = {};

export class Core {
  private overviewContext: OverviewContext = {
    countGlobInclude: {},
    errors: [],
    filesHavingImportsOrExports: 0,
    foundCircularImports: 0,
    lastRun: new Date(),
    notUsedExports: 0,
    pathToPrj: '',
    processedFiles: 0,
    totalEllapsedTime: 0,
    totalExports: 0,
    totalImports: 0,
    workspaceName: '',
  };

  private workspaceRoot: string;

  constructor(workspaceFolder: WorkspaceFolder, private context: ExtensionContext) {
    const { name, uri } = workspaceFolder;
    this.workspaceRoot = uri.fsPath;
    this.overviewContext.workspaceName = name;
    this.overviewContext.pathToPrj = this.workspaceRoot;
    this.doAnalyse();
  }

   get files(): File[] | undefined {
    if (cacheFiles[this.workspaceRoot]) {
      return cacheFiles[this.workspaceRoot];
    }
  }

  private doAnalyse(): Promise<File[] | undefined> {
    this.overviewContext.lastRun = new Date();

    return new Promise(async (resolve) => {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (this.pathExists(packageJsonPath) === false) {
        this.overviewContext.info = 'No package.json found in workspace';
        resolve(undefined);
        return;
      }

      if (!this.files) {
        const tsconfig = loadTsConfig(`${this.workspaceRoot}/tsconfig.json`);
        let parsedFiles = this.context.workspaceState.get('localCache');
        if (!parsedFiles) {
          parsedFiles = parseFiles(tsconfig);
          this.context.workspaceState.update('localCache', parsedFiles);

          writeStorageFile(this.context, 'project-overview.json', parsedFiles);
        }
        const analyzeResult = analyze(JSON.parse(parsedFiles as string));

        const unusedExports = Object.keys(analyzeResult).map((fullPath) => {
          const exportLocations: LocationInFile[] = [];
          const exports: string[] = [];
          analyzeResult[fullPath].forEach(({ exportName, location }) => {
            exportLocations.push(location);
            exports.push(exportName);
          });
          return {
            exportLocations,
            exports,
            imports: {},
            fullPath,
            path: fullPath
          };
        });

        // cacheFiles[this.workspaceRoot] = files;
        cacheFiles[this.workspaceRoot] = unusedExports;
        resolve(undefined);
        return;
      }

      resolve(undefined);
    });
  }

  public registerListener(listener: () => void) {
    if (listeners[this.workspaceRoot] === undefined) {
      listeners[this.workspaceRoot] = [];
    }
    listeners[this.workspaceRoot].push(listener);
  }

  public async refresh() {
    delete cacheFiles[this.workspaceRoot];
    await this.doAnalyse();
    listeners[this.workspaceRoot].forEach((listener) => listener());
  }

  public getOverviewContext() {
    return this.overviewContext;
  }

  public getFilesData(): File[] {
    const cache = cacheFiles[this.workspaceRoot];
    if (cache === undefined) {
      return [];
    }

    return cache;
  }

  /* utility functions */

  public static open(filePath: string): void {
    workspace.openTextDocument(filePath).then((doc) => {
      window.showTextDocument(doc);
    });
  }

  public static findInFile(filePath: string, unusedExportOrCircularImport: string): void {
    workspace.openTextDocument(filePath).then((doc) => {
      window.showTextDocument(doc).then(() => {
        const editor: TextEditor | undefined = window.activeTextEditor;
        const document: TextDocument | undefined = editor?.document;
        if (editor === undefined || document === undefined) {
          return;
        }

        const num = document.lineCount;
        for (let i = 0; i < num; i++) {
          const line = document.lineAt(i);
          if (line.text.includes(unusedExportOrCircularImport)) {
            const start = line.text.indexOf(unusedExportOrCircularImport);
            const end = start + unusedExportOrCircularImport.length;
            editor.selection = new Selection(i, start, i, end);
            break;
          }
        }
        commands.executeCommand('actions.find');
      });
    });
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }
}

