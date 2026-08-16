/**
 * Monaco's editor theme, kept apart from the token layer on purpose.
 *
 * ADR-0002 requires app color to come from semantic tokens, but Monaco's
 * `defineTheme` API takes literal hex strings — it reads a JS object, not CSS,
 * so `hsl(var(--foreground))` cannot reach it. These are the editor's own
 * palette, isolated here so the rest of the app stays token-only and the guard
 * needs exactly one narrow exemption instead of one per call site.
 *
 * Note: the SQL workspace renders this dark theme in both light and dark app
 * themes — a deliberate code-editor convention, not a token gap.
 */
export const MISSION_DARK = {
  name: 'mission-dark',
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '6D9EFF', fontStyle: 'bold' },
    { token: 'string', foreground: '6BC985' },
    { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
    { token: 'number', foreground: 'F5A623' },
    { token: 'type', foreground: '79C0FF' },
    { token: 'operator', foreground: 'FF7B72' },
  ],
  colors: {
    'editor.background': '#111118',
    'editor.foreground': '#E6EDF3',
    'editor.lineHighlightBackground': '#1A1A24',
    'editorLineNumber.foreground': '#3F3F46',
    'editorLineNumber.activeForeground': '#8B949E',
    'editor.selectionBackground': '#264F7833',
    'editorCursor.foreground': '#6D9EFF',
    'editorIndentGuide.background': '#21262D',
    'editorWidget.background': '#161B22',
  },
};

/** Registers the workspace's editor theme with a Monaco instance. */
export const defineCustomThemes = (monaco: {
  editor: { defineTheme: (name: string, theme: unknown) => void };
}) => {
  const { name, ...theme } = MISSION_DARK;
  monaco.editor.defineTheme(name, theme);
};
