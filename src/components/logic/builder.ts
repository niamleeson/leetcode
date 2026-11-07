import type { LogicInterface, LogicParameter } from '../../data/logic/types';

export interface BuilderLine { id: string; text: string; indent: number }
export interface BuilderUnit extends LogicInterface { id: string; lines: BuilderLine[] }
export interface BuilderCursor { unitId: string; index: number; indent: number }
export interface BuilderProgram {
  version: 1;
  preamble: string[];
  units: BuilderUnit[];
  activeUnitId: string;
  cursor: BuilderCursor;
  nextId: number;
}
export type ActionGroupName = 'Store' | 'Loop' | 'Check' | 'Update' | 'Return' | 'More';
export interface BuilderAction {
  id: string;
  label: string;
  /** A complete Python statement. Tapping it inserts this exact text. */
  text: string;
  code: string;
  variants: string[];
  command?: 'end-block';
}
export interface BuilderActionGroup { id: string; label: ActionGroupName; actions: BuilderAction[] }
export interface SourceLocation { unitId: string; lineId: string }
export interface SourceAssembly { code: string; lines: (SourceLocation | null)[] }
export interface EditableToken { start: number; end: number; text: string; choices: string[] }

const identifier = /^[A-Za-z_]\w*$/;
const unique = <T,>(values: T[]) => [...new Set(values)];
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Split commas outside brackets/strings, including annotations and defaults. */
function splitParts(text: string, separator = ','): string[] {
  const result: string[] = [];
  let start = 0, depth = 0, quote = '', escaped = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if ('([{'.includes(char)) depth++;
    else if (')]}'.includes(char)) depth--;
    else if (char === separator && depth === 0) { result.push(text.slice(start, i).trim()); start = i + 1; }
  }
  result.push(text.slice(start).trim());
  return result.filter(Boolean);
}

function parseParameters(source: string): LogicParameter[] {
  return splitParts(source).flatMap(part => {
    const match = part.match(/^(\*{0,2}[A-Za-z_]\w*)\s*(?::\s*(.*?))?\s*(?:=\s*(.*))?$/);
    if (!match) return [];
    return [{ name: match[1], ...(match[2] ? { type: match[2] } : {}), ...(match[3] ? { default: match[3] } : {}) }];
  });
}

export function parseInterfaces(starter: string): LogicInterface[] {
  const interfaces: LogicInterface[] = [];
  let className: string | undefined, classIndent = -1;
  for (const raw of starter.replace(/\r/g, '').split('\n')) {
    const text = raw.trim(), indent = raw.length - raw.trimStart().length;
    const classMatch = text.match(/^class\s+([A-Za-z_]\w*)\b.*:$/);
    if (classMatch) { className = classMatch[1]; classIndent = indent; continue; }
    const match = text.match(/^(?:async\s+)?def\s+([A-Za-z_]\w*)\s*\((.*)\)\s*(?:->\s*(.*?))?\s*:\s*(?:pass)?$/);
    if (!match) continue;
    if (indent <= classIndent) { className = undefined; classIndent = -1; }
    const signature = text.replace(/:\s*pass$/, ':');
    interfaces.push({ kind: className ? 'method' : 'function', ...(className ? { className } : {}), name: match[1], parameters: parseParameters(match[2]), ...(match[3] ? { returnType: match[3] } : {}), signature });
  }
  return interfaces;
}

/** The only input is a public interface skeleton; no problem/answer data. */
export function createBuilder(starter: string, interfaces: LogicInterface[] = parseInterfaces(starter)): BuilderProgram {
  const entries = interfaces.length ? interfaces : parseInterfaces('def solve(value):\n    pass');
  const units = entries.map((entry, i) => ({ ...entry, parameters: entry.parameters.map(parameter => ({ ...parameter })), id: `unit-${i + 1}`, lines: [] }));
  const preamble = unique(['from __future__ import annotations', ...starter.split('\n').map(line => line.trim()).filter(line => /^(?:from\s+\S+\s+import\b|import\s+)/.test(line))]);
  return { version: 1, preamble, units, activeUnitId: units[0].id, cursor: { unitId: units[0].id, index: 0, indent: 0 }, nextId: 1 };
}

/**
 * Restore only the editable draft. Current public signatures/imports remain
 * authoritative; a corrupted stored value can never reach rendering helpers.
 */
export function restoreBuilder(value: unknown, fallback: BuilderProgram): BuilderProgram {
  const record = (item: unknown): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item);
  const text = (item: unknown): item is string => typeof item === 'string' && item.length <= 20_000;
  const whole = (item: unknown, low: number, high: number): item is number => typeof item === 'number' && Number.isSafeInteger(item) && item >= low && item <= high;
  const optionalText = (item: unknown) => item === undefined || text(item);
  const validParameter = (item: unknown) => record(item) && text(item.name) && /^\*{0,2}[A-Za-z_]\w*$/.test(item.name) && optionalText(item.type) && optionalText(item.default);
  try {
    if (!record(value) || value.version !== 1 || !whole(value.nextId, 1, 1_000_000_000) ||
      !Array.isArray(value.preamble) || value.preamble.length > 128 || !value.preamble.every(text) ||
      !Array.isArray(value.units) || !value.units.length || value.units.length > 100 ||
      !text(value.activeUnitId) || !record(value.cursor)) return fallback;

    const unitIds = new Set<string>(), lineIds = new Set<string>();
    const restored = new Map<string, BuilderUnit>();
    let totalLines = 0, largestId = 0;
    for (const item of value.units) {
      if (!record(item) || !text(item.id) || !/^unit-[1-9]\d*$/.test(item.id) || unitIds.has(item.id) ||
        !text(item.name) || !identifier.test(item.name) || (item.kind !== 'function' && item.kind !== 'method') ||
        (item.className !== undefined && (!text(item.className) || !identifier.test(item.className))) ||
        (item.kind === 'method') !== !!item.className || !optionalText(item.returnType) ||
        !text(item.signature) || /[\r\n]/.test(item.signature) ||
        !Array.isArray(item.parameters) || item.parameters.length > 256 || !item.parameters.every(validParameter) ||
        !Array.isArray(item.lines) || (totalLines += item.lines.length) > 5000) return fallback;
      const unitNumber = Number(item.id.slice(5));
      if (!whole(unitNumber, 1, 1_000_000_000)) return fallback;
      largestId = Math.max(largestId, unitNumber);
      unitIds.add(item.id);
      const lines: BuilderLine[] = [];
      for (const line of item.lines) {
        if (!record(line) || !text(line.id) || !/^line-[1-9]\d*$/.test(line.id) || lineIds.has(line.id) ||
          !text(line.text) || !line.text.trim() || /[\r\n]/.test(line.text) || !whole(line.indent, 0, 30)) return fallback;
        const lineNumber = Number(line.id.slice(5));
        if (!whole(lineNumber, 1, 1_000_000_000)) return fallback;
        largestId = Math.max(largestId, lineNumber);
        lineIds.add(line.id);
        lines.push({ id: line.id, text: line.text.trim(), indent: line.indent });
      }
      const canonical = fallback.units.find(unit => unit.id === item.id);
      if (canonical) {
        restored.set(item.id, { ...canonical, parameters: canonical.parameters.map(parameter => ({ ...parameter })), lines });
      } else {
        const parsed = parseInterfaces((item.className ? 'class ' + item.className + ':\n    ' : '') + item.signature + '\n' + (item.className ? '        ' : '    ') + 'pass');
        if (parsed.length !== 1 || parsed[0].name !== item.name || parsed[0].kind !== item.kind) return fallback;
        restored.set(item.id, { ...parsed[0], id: item.id, lines });
      }
    }
    if (fallback.units.some(unit => !restored.has(unit.id))) return fallback;
    const selected = restored.get(value.activeUnitId);
    if (!selected || value.cursor.unitId !== value.activeUnitId || !whole(value.cursor.index, 0, selected.lines.length) || !whole(value.cursor.indent, 0, 30)) return fallback;
    const canonicalIds = new Set(fallback.units.map(unit => unit.id));
    return {
      version: 1,
      preamble: [...fallback.preamble],
      units: [...fallback.units.map(unit => restored.get(unit.id)!), ...[...restored.values()].filter(unit => !canonicalIds.has(unit.id))],
      activeUnitId: value.activeUnitId,
      cursor: { unitId: value.activeUnitId, index: value.cursor.index, indent: value.cursor.indent },
      nextId: Math.max(value.nextId, largestId + 1),
    };
  } catch {
    return fallback;
  }
}

export function activeUnit(program: BuilderProgram): BuilderUnit {
  return program.units.find(unit => unit.id === program.activeUnitId) ?? program.units[0];
}

export function selectUnit(program: BuilderProgram, unitId: string): BuilderProgram {
  const unit = program.units.find(item => item.id === unitId);
  if (!unit) return program;
  return setCursor({ ...program, activeUnitId: unitId }, { unitId, index: unit.lines.length, indent: nextIndent(unit.lines[unit.lines.length - 1]) });
}

export function setCursor(program: BuilderProgram, cursor: Partial<BuilderCursor>): BuilderProgram {
  const unitId = cursor.unitId ?? program.activeUnitId;
  const unit = program.units.find(item => item.id === unitId);
  if (!unit) return program;
  return { ...program, activeUnitId: unitId, cursor: { unitId, index: clamp(cursor.index ?? program.cursor.index, 0, unit.lines.length), indent: clamp(cursor.indent ?? program.cursor.indent, 0, 30) } };
}

function withoutComment(text: string): string {
  let quote = '', escaped = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '#') return text.slice(0, i).trimEnd();
  }
  return text.trimEnd();
}

export function opensBlock(text: string): boolean {
  const code = withoutComment(text).trim();
  return /^(?:(?:async\s+)?(?:def|for|with)|class|if|elif|else|while|try|except|finally|match|case)\b/.test(code) && code.endsWith(':');
}

function nextIndent(line?: BuilderLine): number {
  if (!line) return 0;
  if (opensBlock(line.text)) return Math.min(30, line.indent + 1);
  if (/^return(?:\s|$)/.test(line.text.trim())) return Math.max(0, line.indent - 1);
  return line.indent;
}

function editUnit(program: BuilderProgram, unitId: string, update: (unit: BuilderUnit) => BuilderUnit): BuilderProgram {
  return { ...program, units: program.units.map(unit => unit.id === unitId ? update(unit) : unit) };
}

export function endBlock(program: BuilderProgram): BuilderProgram {
  return setCursor(program, { indent: Math.max(0, program.cursor.indent - 1) });
}

/** Inserts one complete statement or an explicitly supplied multiline snippet. */
export function insertLine(program: BuilderProgram, text: string): BuilderProgram {
  const unit = activeUnit(program), cursor = program.cursor;
  const raw = text.replace(/\r/g, '').split('\n').filter(line => line.trim());
  if (!raw.length) return program;
  const common = Math.min(...raw.map(line => line.length - line.trimStart().length));
  const lines = raw.map((line, index) => ({ id: `line-${program.nextId + index}`, text: line.trim(), indent: cursor.indent + Math.floor((line.length - line.trimStart().length - common) / 4) }));
  if (lines.some(line => line.indent > 30)) return program;
  const result = editUnit(program, unit.id, current => ({ ...current, lines: [...current.lines.slice(0, cursor.index), ...lines, ...current.lines.slice(cursor.index)] }));
  return { ...result, nextId: program.nextId + lines.length, cursor: { unitId: unit.id, index: cursor.index + lines.length, indent: nextIndent(lines[lines.length - 1]) } };
}

export function selectAction(program: BuilderProgram, action: BuilderAction | string, variant?: string): BuilderProgram {
  if (typeof action !== 'string' && action.command === 'end-block') return endBlock(program);
  return insertLine(program, variant ?? (typeof action === 'string' ? action : action.text));
}

function findLine(program: BuilderProgram, lineId: string) {
  for (const unit of program.units) {
    const index = unit.lines.findIndex(line => line.id === lineId);
    if (index >= 0) return { unit, index, line: unit.lines[index] };
  }
  return undefined;
}

export function updateLine(program: BuilderProgram, lineId: string, text: string): BuilderProgram {
  const found = findLine(program, lineId);
  if (!found || !text.trim() || /[\r\n]/.test(text)) return program;
  return editUnit(program, found.unit.id, unit => ({ ...unit, lines: unit.lines.map(line => line.id === lineId ? { ...line, text: text.trim() } : line) }));
}

/** A compound statement moves/deletes together with its body and clauses. */
export function blockRange(lines: BuilderLine[], index: number): [number, number] {
  if (!lines[index]) return [index, index];
  const first = lines[index], head = first.text.trim().split(/\s|:/)[0];
  const clauses = head === 'if' ? ['elif', 'else'] : head === 'try' ? ['except', 'else', 'finally'] : ['for', 'while'].includes(head) ? ['else'] : [];
  let end = index + 1;
  while (end < lines.length) {
    if (lines[end].indent > first.indent) { end++; continue; }
    if (lines[end].indent === first.indent && clauses.includes(lines[end].text.trim().split(/\s|:/)[0])) { end++; continue; }
    break;
  }
  return [index, end];
}

export function deleteLine(program: BuilderProgram, lineId: string): BuilderProgram {
  const found = findLine(program, lineId);
  if (!found) return program;
  const [start, end] = blockRange(found.unit.lines, found.index);
  const result = editUnit(program, found.unit.id, unit => ({ ...unit, lines: [...unit.lines.slice(0, start), ...unit.lines.slice(end)] }));
  return setCursor(result, { unitId: found.unit.id, index: start, indent: found.line.indent });
}

export function indentLine(program: BuilderProgram, lineId: string, delta: number): BuilderProgram {
  const found = findLine(program, lineId);
  if (!found || !delta) return program;
  const [start, end] = blockRange(found.unit.lines, found.index);
  const largestIndent = Math.max(...found.unit.lines.slice(start, end).map(line => line.indent));
  const amount = clamp(Math.trunc(delta), -found.line.indent, 30 - largestIndent);
  if (!amount) return program;
  const result = editUnit(program, found.unit.id, unit => ({ ...unit, lines: unit.lines.map((line, i) => i >= start && i < end ? { ...line, indent: line.indent + amount } : line) }));
  return setCursor(result, { unitId: found.unit.id, index: end, indent: found.line.indent + amount });
}

export function moveLine(program: BuilderProgram, lineId: string, direction: 'up' | 'down' | -1 | 1): BuilderProgram {
  const found = findLine(program, lineId);
  if (!found) return program;
  const lines = found.unit.lines, [start, end] = blockRange(lines, found.index);
  let reordered: BuilderLine[], nextStart: number;
  if (direction === 'up' || direction === -1) {
    let previous = start - 1;
    while (previous >= 0 && lines[previous].indent > found.line.indent) previous--;
    if (previous < 0 || lines[previous].indent !== found.line.indent) return program;
    // An elif/else belongs to its preceding if, not to the next statement.
    while (previous > 0 && /^(elif|else|except|finally)\b/.test(lines[previous].text)) {
      previous--;
      while (previous >= 0 && lines[previous].indent > found.line.indent) previous--;
    }
    if (previous < 0 || blockRange(lines, previous)[1] !== start) return program;
    reordered = [...lines.slice(0, previous), ...lines.slice(start, end), ...lines.slice(previous, start), ...lines.slice(end)]; nextStart = previous;
  } else {
    if (end >= lines.length || lines[end].indent !== found.line.indent) return program;
    const nextEnd = blockRange(lines, end)[1];
    reordered = [...lines.slice(0, start), ...lines.slice(end, nextEnd), ...lines.slice(start, end), ...lines.slice(nextEnd)]; nextStart = start + nextEnd - end;
  }
  return setCursor(editUnit(program, found.unit.id, unit => ({ ...unit, lines: reordered })), { unitId: found.unit.id, index: nextStart, indent: found.line.indent });
}

export function addFunction(program: BuilderProgram, signature?: string, className = activeUnit(program).className): BuilderProgram {
  signature ??= className ? 'def helper(self, value):' : 'def helper(value):';
  const parsed = parseInterfaces(`${className ? `class ${className}:\n    ` : ''}${signature}\n${className ? '        ' : '    '}pass`)[0];
  if (!parsed) return program;
  const id = `unit-${program.nextId + program.units.length}`;
  const unit = { ...parsed, id, lines: [] };
  return { ...program, units: [...program.units, unit], activeUnitId: id, cursor: { unitId: id, index: 0, indent: 0 }, nextId: program.nextId + 1 };
}

export function assembleSourceWithMap(program: BuilderProgram): SourceAssembly {
  const source: string[] = [], locations: (SourceLocation | null)[] = [];
  const emit = (text: string, location: SourceLocation | null = null) => { source.push(text); locations.push(location); };
  for (const line of program.preamble) emit(line);
  if (program.preamble.length) emit('');
  const groups = new Map<string, BuilderUnit[]>();
  for (const unit of program.units) {
    const key = unit.className ? `class:${unit.className}` : unit.id;
    groups.set(key, [...(groups.get(key) ?? []), unit]);
  }
  for (const units of groups.values()) {
    const className = units[0].className;
    if (className) emit(`class ${className}:`);
    for (const unit of units) {
      const base = className ? 1 : 0;
      emit('    '.repeat(base) + unit.signature.trim());
      if (!unit.lines.some(line => withoutComment(line.text).trim())) emit('    '.repeat(base + 1) + 'pass');
      for (const [index, line] of unit.lines.entries()) {
        emit('    '.repeat(base + 1 + line.indent) + line.text, { unitId: unit.id, lineId: line.id });
        // Empty blocks remain runnable/editable. Synthetic pass is never shown
        // as a learner decision or mapped onto a user-created line.
        let bodyIndex = index + 1;
        while (bodyIndex < unit.lines.length && unit.lines[bodyIndex].indent > line.indent && !withoutComment(unit.lines[bodyIndex].text).trim()) bodyIndex++;
        if (opensBlock(line.text) && (!unit.lines[bodyIndex] || unit.lines[bodyIndex].indent <= line.indent)) emit('    '.repeat(base + 2 + line.indent) + 'pass');
      }
      emit('');
    }
  }
  while (source[source.length - 1] === '') { source.pop(); locations.pop(); }
  return { code: source.join('\n') + '\n', lines: [...locations, null] };
}

export const assembleSource = (program: BuilderProgram) => assembleSourceWithMap(program).code;
export const sourceFor = assembleSource;
export const createDocument = createBuilder;

type ValueKind = 'number' | 'string' | 'boolean' | 'list' | 'dict' | 'set' | 'node' | 'callable' | 'unknown';
export interface VisibleBinding { name: string; kind: ValueKind; element?: ValueKind; origin: 'parameter' | 'local' | 'loop' | 'attribute' }

function annotationKind(annotation = ''): { kind: ValueKind; element?: ValueKind } {
  const type = annotation.toLowerCase().replace(/["']/g, '');
  if (/^(list|tuple|sequence|iterable|deque)\b|\[\]$/.test(type)) {
    const element = type.match(/\[(.*)\]/)?.[1] ?? type.replace(/\[\]$/, '');
    return { kind: 'list', element: annotationKind(element).kind };
  }
  if (/^(dict|defaultdict|counter|mapping)\b/.test(type)) return { kind: 'dict' };
  if (/^(set|frozenset)\b/.test(type)) return { kind: 'set' };
  if (/\b(int|integer|float|double|long|number)\b/.test(type)) return { kind: 'number' };
  if (/\b(str|string|char)\b/.test(type)) return { kind: 'string', element: 'string' };
  if (/\b(bool|boolean)\b/.test(type)) return { kind: 'boolean' };
  if (/node|tree|mountainarray/.test(type)) return { kind: 'node' };
  return { kind: 'unknown' };
}

function expressionKind(expression: string, bindings: Map<string, VisibleBinding>): { kind: ValueKind; element?: ValueKind } {
  const text = withoutComment(expression).trim();
  const known = bindings.get(text);
  if (known) return { kind: known.kind, element: known.element };
  if (/^["']/.test(text)) return { kind: 'string', element: 'string' };
  if (/^(True|False)$/.test(text) || /\s(?:==|!=|<=|>=|<|>|in|is)\s/.test(text)) return { kind: 'boolean' };
  if (/^-?\d+(?:\.\d+)?$/.test(text) || /^(len|sum|abs|int|float|min|max)\(/.test(text) || /\s[-+*/%]\s|\/\//.test(text)) return { kind: 'number' };
  if (/^(\[|list\(|sorted\(|deque\()/.test(text)) return { kind: 'list', element: 'unknown' };
  if (/^(dict|defaultdict|Counter)\(/.test(text) || text === '{}' || /^\{.*:/.test(text)) return { kind: 'dict' };
  if (/^(set|frozenset)\(/.test(text) || /^\{.+\}$/.test(text)) return { kind: 'set' };
  const access = text.match(/^([\w.]+)\[.*\]$/);
  if (access) return { kind: bindings.get(access[1])?.element ?? 'unknown' };
  if (/^(TreeNode|ListNode|Node)\(/.test(text)) return { kind: 'node' };
  return { kind: 'unknown' };
}

/** Binding discovery uses only the interface and learner-authored statements. */
export function visibleBindings(program: BuilderProgram): VisibleBinding[] {
  const unit = activeUnit(program);
  let bindings = new Map<string, VisibleBinding>(unit.parameters.filter(p => !['self', 'cls'].includes(p.name)).map(parameter => [parameter.name.replace(/^\*+/, ''), { name: parameter.name.replace(/^\*+/, ''), ...annotationKind(parameter.type), origin: 'parameter' }]));
  // Class attributes intentionally come from the learner's other method bodies,
  // so a constructor-built container is available when editing an operation.
  for (const sibling of program.units.filter(item => item.className && item.className === unit.className)) for (const line of sibling.lines) {
    const match = line.text.match(/^(self\.[A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (match) bindings.set(match[1], { name: match[1], ...expressionKind(match[2], bindings), origin: 'attribute' });
  }
  const scopes: { indent: number; parent: Map<string, VisibleBinding> }[] = [];
  for (const line of unit.lines.slice(0, program.cursor.index)) {
    while (scopes.length && line.indent <= scopes[scopes.length - 1].indent) bindings = scopes.pop()!.parent;
    const text = withoutComment(line.text).trim();
    const helper = text.match(/^def\s+([A-Za-z_]\w*)\((.*)\).*:$/);
    if (helper) {
      bindings.set(helper[1], { name: helper[1], kind: 'callable', origin: 'local' });
      scopes.push({ indent: line.indent, parent: bindings }); bindings = new Map(bindings);
      for (const parameter of parseParameters(helper[2])) bindings.set(parameter.name, { name: parameter.name, ...annotationKind(parameter.type), origin: 'parameter' });
      continue;
    }
    const loop = text.match(/^for\s+(.+?)\s+in\s+(.+):$/);
    if (loop) {
      const names = splitParts(loop[1].replace(/^\(|\)$/g, ''));
      const enumerate = loop[2].match(/^enumerate\((.*)\)$/);
      const sequence = bindings.get(enumerate ? enumerate[1] : loop[2]);
      for (const [index, name] of names.entries()) if (identifier.test(name)) {
        const kind = enumerate && index === 0 || /^range\(/.test(loop[2]) ? 'number' : sequence?.element ?? (sequence?.kind === 'string' ? 'string' : 'unknown');
        bindings.set(name, { name, kind, origin: 'loop' });
      }
      continue;
    }
    const assignment = text.match(/^([A-Za-z_][\w.]*(?:\s*,\s*[A-Za-z_][\w.]*)*)\s*(?::\s*(.+?))?\s*=\s*(?!=)(.+)$/);
    if (assignment) {
      const names = splitParts(assignment[1]), expressions = splitParts(assignment[3]);
      for (const [i, name] of names.entries()) bindings.set(name, { name, ...(assignment[2] ? annotationKind(assignment[2]) : expressionKind(expressions[i] ?? assignment[3], bindings)), origin: name.startsWith('self.') ? 'attribute' : 'local' });
    }
  }
  while (scopes.length && program.cursor.indent <= scopes[scopes.length - 1].indent) bindings = scopes.pop()!.parent;
  return [...bindings.values()];
}

const actionLabels: Record<string, string> = {
  'store-map': 'Create a dictionary', 'store-set': 'Create a set', 'store-result': 'Start a result',
  'store-bounds': 'Set two bounds', 'store-number': 'Store a midpoint', 'store-first': 'Remember the first item',
  'loop-values': 'Loop over values', 'loop-enumerate': 'Loop with an index', 'loop-indices': 'Loop over indices',
  'loop-while': 'Repeat while true', 'loop-inner': 'Loop in another order', 'loop-entries': 'Loop over entries',
  'check-member': 'Check membership', 'check-expression-member': 'Check an expression', 'check-equal': 'Compare equality',
  'check-order': 'Compare order', 'check-empty': 'Check for empty', 'check-else': 'Add another branch',
  'update-container': 'Store the current value', 'update-add': 'Add a value', 'update-maximum': 'Update a maximum',
  'update-minimum': 'Update a minimum', 'update-position': 'Move a position', 'update-value': 'Change a value',
  'return-false': 'Return false', 'return-true': 'Return true', 'return-value': 'Return a value',
  'return-empty': 'Return a default', 'return-pair': 'Return a list', 'return-compare': 'Return a comparison',
  'end-block': 'End block', 'control-break': 'Stop the loop', 'control-continue': 'Skip this iteration',
  'import-tools': 'Import a tool', 'helper-function': 'Define a helper', 'inspect-value': 'Print a value',
};

function action(id: string, text: string, variants: (string | undefined)[] = []): BuilderAction {
  return { id, label: actionLabels[id] ?? text, text, code: text, variants: unique([text, ...variants.filter((value): value is string => !!value)]).slice(0, 32) };
}

/** Fixed categories of Python operations, never a problem-specific recipe. */
export function getActionGroups(program: BuilderProgram): BuilderActionGroup[] {
  const bindings = visibleBindings(program);
  const unit = activeUnit(program);
  const named = (name: string) => bindings.some(binding => binding.name === name) ? name : undefined;
  const sequences = bindings.filter(binding => ['list', 'string'].includes(binding.kind));
  const sequence = sequences[0]?.name ?? bindings.find(binding => binding.kind === 'unknown' && binding.origin === 'parameter')?.name;
  const strings = bindings.filter(binding => binding.kind === 'string' && binding.origin !== 'loop').map(binding => binding.name);
  const mappings = bindings.filter(binding => binding.kind === 'dict').map(binding => binding.name);
  const sets = bindings.filter(binding => binding.kind === 'set').map(binding => binding.name);
  const numbers = bindings.filter(binding => binding.kind === 'number').map(binding => binding.name);
  const locals = bindings.filter(binding => binding.origin !== 'parameter');
  const value = bindings.find(binding => binding.origin === 'loop' && binding.name !== 'i' && binding.name !== 'j')?.name ?? (sequence ? `${sequence}[0]` : numbers[0] ?? '0');
  const i = named('i'), j = named('j'), mid = named('mid'), left = named('left'), right = named('right');
  const target = bindings.find(binding => binding.origin === 'parameter' && binding.kind === 'number')?.name;
  const seen = mappings[0] ?? sets[0];
  const result = named('result') ?? locals.find(binding => binding.kind === 'number')?.name;
  const minimum = named('minimum');
  const middle = left && right ? `(${left} + ${right}) // 2` : sequence ? `len(${sequence}) // 2` : '0';
  const current = sequence && (mid || i) ? `${sequence}[${mid ?? i}]` : value;
  const difference = target ? `${target} - ${value}` : undefined;
  const numericReturns = unique([mid, result, ...numbers, '0', '1', '-1'].filter((item): item is string => !!item));
  const listReturns = unique([mappings[0] && difference && i ? `[${mappings[0]}[${difference}], ${i}]` : undefined, i && j ? `[${i}, ${j}]` : undefined, sequence ? sequence : undefined, '[]'].filter((item): item is string => !!item));
  const declarationNames = ['result', 'count', 'left', 'right', 'mid', 'minimum'];
  const store = [
    action('store-map', 'seen = {}', ['counts = {}', 'graph = {}', 'self.items = {}']),
    action('store-set', 'seen = set()', ['visited = set()', 'self.items = set()']),
    action('store-result', 'result = 0', ['result = []', 'result = False', 'result = ""', 'count = 0', 'self.items = []']),
    action('store-bounds', sequence ? `left, right = 0, len(${sequence}) - 1` : 'left, right = 0, 1', ['left = 0', sequence ? `right = len(${sequence}) - 1` : 'right = 1', `mid = ${middle}`]),
    action('store-number', `mid = ${middle}`, declarationNames.map(name => `${name} = 0`)),
    action('store-first', sequence ? `minimum = ${sequence}[0]` : 'minimum = 0', [sequence ? `maximum = ${sequence}[0]` : 'maximum = 0', sequence ? `n = len(${sequence})` : 'n = 0', 'minimum = float("inf")', 'maximum = float("-inf")']),
  ];
  const loops = [
    action('loop-values', sequence ? `for value in ${sequence}:` : 'for value in range(10):', sequences.map(item => `for ${item.kind === 'string' ? 'char' : 'value'} in ${item.name}:`)),
    action('loop-enumerate', sequence ? `for i, value in enumerate(${sequence}):` : 'for i, value in enumerate([]):', sequences.map(item => `for i, value in enumerate(${item.name}):`)),
    action('loop-indices', sequence ? `for i in range(len(${sequence})):` : 'for i in range(10):', [sequence && i ? `for j in range(${i} + 1, len(${sequence})):` : undefined, sequence ? `for i in range(len(${sequence}) - 1, -1, -1):` : undefined]),
    action('loop-while', left && right ? `while ${left} <= ${right}:` : seen ? `while ${seen}:` : 'while True:', [left && right ? `while ${left} < ${right}:` : undefined, 'while True:', 'while False:']),
    action('loop-inner', sequence && i ? `for j in range(${i} + 1, len(${sequence})):` : sequence ? `for value in reversed(${sequence}):` : 'for j in range(10):', [sequence ? `for j in range(len(${sequence})):` : undefined]),
    action('loop-entries', mappings[0] ? `for key, value in ${mappings[0]}.items():` : sequence ? `for value in sorted(${sequence}):` : 'for value in range(2):', mappings.map(map => `for key in ${map}:`)),
  ];
  const comparisonLeft = sequence && i && j ? `${sequence}[${i}] + ${sequence}[${j}]` : current;
  const comparisonRight = target ?? numbers.find(number => number !== current) ?? '0';
  const checks = [
    action('check-member', seen ? `if ${value} in ${seen}:` : sequence ? `if ${value} in ${sequence}:` : 'if True:', seen ? [`if ${value} not in ${seen}:`] : ['if False:']),
    action('check-expression-member', seen && difference ? `if ${difference} in ${seen}:` : strings.length > 1 ? `if len(${strings[0]}) == len(${strings[1]}):` : `if ${current} == ${comparisonRight}:`, seen && target ? [`if ${target} + ${value} in ${seen}:`, `if ${difference} not in ${seen}:`] : []),
    action('check-equal', `if ${comparisonLeft} == ${comparisonRight}:`, ['!=', '<', '<=', '>', '>='].map(operator => `if ${comparisonLeft} ${operator} ${comparisonRight}:`)),
    action('check-order', `if ${current} < ${comparisonRight}:`, ['<=', '>', '>=', '!=', '=='].map(operator => `if ${current} ${operator} ${comparisonRight}:`)),
    action('check-empty', sequence ? `if not ${sequence}:` : seen ? `if not ${seen}:` : 'if False:', bindings.filter(binding => ['list', 'dict', 'set', 'node'].includes(binding.kind)).flatMap(binding => [`if not ${binding.name}:`, `if ${binding.name} is None:`])),
    action('check-else', 'else:', [`elif ${current} == ${comparisonRight}:`, `elif ${current} > ${comparisonRight}:`]),
  ];
  const updates = [
    action('update-container', mappings[0] ? `${mappings[0]}[${value}] = ${i ?? '1'}` : sets[0] ? `${sets[0]}.add(${value})` : result ? `${result} += 1` : 'count = 1', [sets[0] ? `${sets[0]}.add(${value})` : undefined, mappings[0] ? `${mappings[0]}[${value}] = ${mappings[0]}.get(${value}, 0) + 1` : undefined, mappings[0] ? `${mappings[0]}[${value}] = ${i ?? '0'}` : undefined]),
    action('update-add', sets[0] ? `${sets[0]}.add(${value})` : bindings.find(binding => binding.kind === 'list' && binding.origin === 'local') ? `${bindings.find(binding => binding.kind === 'list' && binding.origin === 'local')!.name}.append(${value})` : result ? `${result} += ${value}` : 'count = 1', [...sets.map(set => `${set}.discard(${value})`), ...bindings.filter(binding => binding.kind === 'list').map(binding => `${binding.name}.append(${value})`)]),
    action('update-maximum', result && minimum ? `${result} = max(${result}, ${value} - ${minimum})` : result ? `${result} = max(${result}, ${value})` : `result = max(0, ${value})`, result ? [`${result} = min(${result}, ${value})`, `${result} = max(${result}, ${value})`, minimum ? `${result} = max(${result}, ${minimum} - ${value})` : undefined, `${result} += ${value}`] : []),
    action('update-minimum', minimum ? `${minimum} = min(${minimum}, ${value})` : result ? `${result} = min(${result}, ${value})` : `minimum = ${value}`, minimum ? [`${minimum} = max(${minimum}, ${value})`, `${minimum} = ${value}`] : []),
    action('update-position', left && mid ? `${left} = ${mid} + 1` : left ? `${left} += 1` : i ? `${i} += 1` : 'left = 0', [right && mid ? `${right} = ${mid} - 1` : undefined, left && mid ? `${left} = ${mid}` : undefined, right && mid ? `${right} = ${mid}` : undefined, right ? `${right} -= 1` : undefined, left ? `${left} += 1` : undefined]),
    action('update-value', sequence && i && sequences[0]?.kind !== 'string' ? `${sequence}[${i}] = ${value}` : sequence ? sequences[0]?.kind === 'string' ? `result = sorted(${sequence})` : `${sequence}.sort()` : result ? `${result} = 0` : 'result = 0', [sequence && i && j ? `${sequence}[${i}], ${sequence}[${j}] = ${sequence}[${j}], ${sequence}[${i}]` : undefined, ...numbers.slice(0, 4).flatMap(number => [`${number} += 1`, `${number} -= 1`])]),
  ];
  const returns = [
    action('return-false', 'return False', ['return True', 'return None']),
    action('return-true', 'return True', ['return False', 'return None']),
    action('return-value', `return ${numericReturns[0]}`, unique([...numericReturns, ...bindings.map(binding => binding.name)]).map(name => `return ${name}`)),
    action('return-empty', annotationKind(unit.returnType).kind === 'list' ? 'return []' : 'return -1', ['return []', 'return -1', 'return 0', 'return ""', 'return None']),
    action('return-pair', `return ${listReturns[0]}`, [...listReturns.map(value => `return ${value}`), ...(i ? [`return [${i}]`] : []), sequence ? `return len(${sequence})` : 'return 0']),
    action('return-compare', strings.length > 1 ? `return sorted(${strings[0]}) == sorted(${strings[1]})` : sequence ? `return len(${sequence}) == len(set(${sequence}))` : `return ${current} == ${comparisonRight}`, [strings.length > 1 ? `return ${strings[0]} == ${strings[1]}` : undefined, strings.length > 1 ? `return sorted(${strings[0]}) != sorted(${strings[1]})` : undefined, sequence ? `return len(${sequence}) != len(set(${sequence}))` : undefined, `return ${current} != ${comparisonRight}`]),
  ];
  const more = [
    { ...action('end-block', 'End block'), command: 'end-block' as const },
    action('control-break', 'break', ['continue', 'pass', 'return']),
    action('control-continue', 'continue', ['break', 'pass']),
    action('import-tools', 'from collections import Counter', ['from collections import defaultdict', 'from collections import deque', 'import heapq', 'import math', 'from functools import lru_cache']),
    action('helper-function', 'def helper(value):', ['def helper(left, right):', 'def visit(node):', 'class Helper:', 'try:', 'except ValueError:', 'finally:']),
    action('inspect-value', `print(${result ?? value})`, ['pass', 'raise ValueError("Check this case")', 'return None']),
  ];
  // The public return type controls presentation order; every choice remains
  // available. This uses neither the problem identity nor expected results.
  const returnKind = annotationKind(unit.returnType).kind;
  const returnOrder = returnKind === 'list' ? ['return-pair', 'return-value', 'return-empty', 'return-compare', 'return-false', 'return-true']
    : returnKind === 'boolean' ? ['return-false', 'return-true', 'return-compare', 'return-value', 'return-empty', 'return-pair']
      : ['return-value', 'return-empty', 'return-compare', 'return-pair', 'return-false', 'return-true'];
  const orderedReturns = returnOrder.map(id => returns.find(item => item.id === id)!);
  return ([['Store', store], ['Loop', loops], ['Check', checks], ['Update', updates], ['Return', orderedReturns], ['More', more]] as [ActionGroupName, BuilderAction[]][]).map(([label, actions]) => {
    const distinct = new Map<string, BuilderAction>();
    for (const action of actions) {
      const prior = distinct.get(action.text);
      distinct.set(action.text, prior ? { ...prior, variants: unique([...prior.variants, ...action.variants]) } : action);
    }
    return { id: label.toLowerCase(), label, actions: [...distinct.values()] };
  });
}

export function tokenChoices(program: BuilderProgram, lineId: string): EditableToken[] {
  const found = findLine(program, lineId);
  if (!found) return [];
  const before = setCursor(program, { unitId: found.unit.id, index: found.index, indent: found.line.indent });
  const names = unique([...visibleBindings(before).map(binding => binding.name), 'result', 'seen', 'count', 'value', 'i', 'j', 'left', 'right', 'mid', 'minimum', 'helper']);
  const tokens: EditableToken[] = [];
  const pattern = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*|\d+(?:\.\d+)?|==|!=|<=|>=|\/\/=?|\*\*|\+=|-=|\*=|\/=|[-+*/%<>=]/g;
  for (const match of found.line.text.matchAll(pattern)) {
    const text = match[0], start = match.index!;
    let choices: string[];
    if (['True', 'False', 'None'].includes(text)) choices = ['True', 'False', 'None'];
    else if (/^\d/.test(text)) choices = ['0', '1', '2', '-1', ...names];
    else if (/^["']/.test(text)) choices = ['""', '"a"', '"b"', '"0"'];
    else if (['==', '!=', '<', '<=', '>', '>='].includes(text)) choices = ['==', '!=', '<', '<=', '>', '>='];
    else if (['+', '-', '*', '/', '//', '%', '**'].includes(text)) choices = ['+', '-', '*', '//', '%', '/', '**'];
    else if (['=', '+=', '-=', '*=', '/=', '//='].includes(text)) choices = ['=', '+=', '-=', '*=', '//='];
    else if (['if', 'elif'].includes(text)) choices = ['if', 'elif'];
    else if (['min', 'max', 'sum', 'len', 'sorted', 'set', 'list', 'tuple', 'abs'].includes(text)) choices = ['min', 'max', 'sum', 'len', 'sorted', 'set', 'list', 'tuple', 'abs'];
    else if (['for', 'in', 'while', 'return', 'else', 'def', 'class', 'from', 'import', 'not', 'and', 'or', 'is', 'break', 'continue', 'pass'].includes(text)) continue;
    else choices = names;
    tokens.push({ start, end: start + text.length, text, choices: unique([text, ...choices]) });
  }
  return tokens;
}

export function replaceToken(program: BuilderProgram, lineId: string, start: number, end: number, replacement: string): BuilderProgram {
  const found = findLine(program, lineId);
  if (!found || start < 0 || end > found.line.text.length || end <= start || /[\r\n]/.test(replacement)) return program;
  return updateLine(program, lineId, found.line.text.slice(0, start) + replacement + found.line.text.slice(end));
}

export function getLineVariants(program: BuilderProgram, lineId: string): string[] {
  const found = findLine(program, lineId);
  if (!found) return [];
  const before = setCursor(program, { unitId: found.unit.id, index: found.index, indent: found.line.indent });
  const category = /^return\b/.test(found.line.text) ? 'Return' : /^(if|elif|else)\b/.test(found.line.text) ? 'Check' : /^(for|while)\b/.test(found.line.text) ? 'Loop' : 'Update';
  const statements = getActionGroups(before).find(group => group.label === category)?.actions.flatMap(action => action.variants) ?? [];
  const substitutions = tokenChoices(program, lineId).flatMap(token => token.choices.slice(0, 5).map(choice => found.line.text.slice(0, token.start) + choice + found.line.text.slice(token.end)));
  return unique([found.line.text, ...statements, ...substitutions]).slice(0, 48);
}
