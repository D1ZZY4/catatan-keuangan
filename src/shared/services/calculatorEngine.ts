export type CalcOp = '+' | '-' | '*' | '/';

export interface CalcState {
  display: string;
  expression: string;
  lastResult: number | null;
  history: string[];
}

const MAX_HISTORY = 5;

export function createCalcState(): CalcState {
  return { display: '0', expression: '', lastResult: null, history: [] };
}

export function calcInput(state: CalcState, key: string): CalcState {
  const { display, expression } = state;

  if (key === 'C') {
    return createCalcState();
  }

  if (key === '=') {
    try {
      const expr = expression + display;
      const result = evalExpr(expr);
      if (!isFinite(result)) return state;
      const rounded = parseFloat(result.toPrecision(12));
      const historyEntry = `${expr} = ${rounded.toLocaleString('id-ID')}`;
      const newHistory = [historyEntry, ...state.history].slice(0, MAX_HISTORY);
      return {
        display: rounded.toString(),
        expression: '',
        lastResult: rounded,
        history: newHistory,
      };
    } catch {
      return state;
    }
  }

  if (['+', '-', '*', '/'].includes(key)) {
    const numDisplay = parseFloat(display);
    if (isNaN(numDisplay)) return state;
    return {
      ...state,
      expression: expression + display + key,
      display: '0',
    };
  }

  if (key === '.') {
    if (display.includes('.')) return state;
    return { ...state, display: display + '.' };
  }

  if (key === '⌫' || key === 'del') {
    const next = display.length > 1 ? display.slice(0, -1) : '0';
    return { ...state, display: next };
  }

  if (key === '%') {
    const val = parseFloat(display);
    if (isNaN(val)) return state;
    return { ...state, display: (val / 100).toString() };
  }

  if (key === '±') {
    const val = parseFloat(display);
    if (isNaN(val)) return state;
    return { ...state, display: (-val).toString() };
  }

  if (/\d/.test(key)) {
    const next = display === '0' ? key : display + key;
    if (next.length > 15) return state;
    return { ...state, display: next };
  }

  return state;
}

function evalExpr(expr: string): number {
  const tokens = tokenize(expr);
  return parseMDAS(tokens);
}

function tokenize(expr: string): Array<number | string> {
  const re = /(\d+\.?\d*|[+\-*/])/g;
  const tokens: Array<number | string> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(expr)) !== null) {
    const t = m[1];
    if (t !== undefined) {
      tokens.push(/\d/.test(t[0] ?? '') ? parseFloat(t) : t);
    }
  }
  return tokens;
}

function parseMDAS(tokens: Array<number | string>): number {
  let result = parseAS(tokens, 0).value;
  return result;
}

function parseAS(
  tokens: Array<number | string>,
  pos: number,
): { value: number; pos: number } {
  let { value: left, pos: p } = parseMD(tokens, pos);
  while (p < tokens.length && (tokens[p] === '+' || tokens[p] === '-')) {
    const op = tokens[p] as string;
    const right = parseMD(tokens, p + 1);
    left = op === '+' ? left + right.value : left - right.value;
    p = right.pos;
  }
  return { value: left, pos: p };
}

function parseMD(
  tokens: Array<number | string>,
  pos: number,
): { value: number; pos: number } {
  let p = pos;
  let left = typeof tokens[p] === 'number' ? (tokens[p] as number) : 0;
  p++;
  while (p < tokens.length && (tokens[p] === '*' || tokens[p] === '/')) {
    const op = tokens[p] as string;
    p++;
    const right = typeof tokens[p] === 'number' ? (tokens[p] as number) : 0;
    left = op === '*' ? left * right : left / right;
    p++;
  }
  return { value: left, pos: p };
}

export function formatCalcDisplay(display: string): string {
  const parts = display.split('.');
  const intPart = parts[0] ?? '0';
  const decPart = parts[1];
  const formatted = parseInt(intPart, 10).toLocaleString('id-ID');
  return decPart !== undefined ? `${formatted},${decPart}` : formatted;
}
