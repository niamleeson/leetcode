import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as jsxRuntime from 'react/jsx-runtime';
import ts from 'typescript';

// Compile and execute the same standalone source that readers copy from the page.
export function loadSolution(code: string): Record<string, any> {
  const compiled = ts.transpileModule(code, {
    fileName: 'solution.jsx',
    reportDiagnostics: true,
    compilerOptions: {
      allowJs: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const errors = compiled.diagnostics?.filter(item => item.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) {
    throw new Error(errors.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n'));
  }
  const module = { exports: {} as Record<string, any> };
  const require = (name: string) => {
    if (name === 'react') return React;
    if (name === 'react-dom') return ReactDOM;
    if (name === 'react/jsx-runtime') return jsxRuntime;
    throw new Error(`Unexpected solution dependency: ${name}`);
  };
  new Function('require', 'module', 'exports', compiled.outputText)(require, module, module.exports);
  return module.exports;
}
