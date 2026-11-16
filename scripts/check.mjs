import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const result = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext
  },
  reportDiagnostics: true
});
const errors = (result.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
if (errors.length) {
  for (const error of errors) console.error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  process.exit(1);
}
console.log('App.tsx: sintaxis JSX/TSX válida.');
