import { SymbolKind, ThemeIcon } from 'vscode';

// vscode.SymbolKind.File === 0, Module === 1, etc...
const _themeIconIds = [
	'symbol-file', 'symbol-module', 'symbol-namespace', 'symbol-package', 'symbol-class', 'symbol-method',
	'symbol-property', 'symbol-field', 'symbol-constructor', 'symbol-enum', 'symbol-interface',
	'symbol-function', 'symbol-variable', 'symbol-constant', 'symbol-string', 'symbol-number', 'symbol-boolean',
	'symbol-array', 'symbol-object', 'symbol-key', 'symbol-null', 'symbol-enum-member', 'symbol-struct',
	'symbol-event', 'symbol-operator', 'symbol-type-parameter'
];

export function getThemeIcon(kind: SymbolKind): ThemeIcon | undefined {
	let id = _themeIconIds[kind];
	return id ? new ThemeIcon(id) : undefined;
}
