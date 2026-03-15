/**
 * Skin color definitions shared between web UI, MCP, and CLI.
 * Maps skin name → QR code colors (dark = foreground dots, light = background).
 */
export const SKIN_COLORS: Record<string, { darkColor: string; lightColor: string }> = {
  gold:     { darkColor: '#ffd700', lightColor: '#1a1207' },
  neon:     { darkColor: '#39ff14', lightColor: '#0d0d0d' },
  silver:   { darkColor: '#e8e8e8', lightColor: '#141418' },
  sunset:   { darkColor: '#ff6b6b', lightColor: '#fff9db' },
  ocean:    { darkColor: '#0077b6', lightColor: '#caf0f8' },
  bronze:   { darkColor: '#cd7f32', lightColor: '#1a120a' },
  midnight: { darkColor: '#e2e8f0', lightColor: '#0f172a' },
  rose:     { darkColor: '#e91e63', lightColor: '#fce4ec' },
  classy:   { darkColor: '#1a1a2e', lightColor: '#ffffff' },
  elegant:  { darkColor: '#2d3436', lightColor: '#ffffff' },
  bubble:   { darkColor: '#000000', lightColor: '#ffffff' },
  classic:  { darkColor: '#000000', lightColor: '#ffffff' },
  modern:   { darkColor: '#000000', lightColor: '#ffffff' },
  dots:     { darkColor: '#000000', lightColor: '#ffffff' },
  inverted: { darkColor: '#ffffff', lightColor: '#000000' },
};

export const SKIN_NAMES = Object.keys(SKIN_COLORS) as [string, ...string[]];

/**
 * Resolve final colors from skin + explicit overrides.
 * Priority: explicit color > skin > default (black/white).
 */
export function resolveColors(params: {
  skin?: string;
  darkColor?: string;
  lightColor?: string;
}): { darkColor: string; lightColor: string } {
  const skinColors = params.skin ? SKIN_COLORS[params.skin] : null;
  return {
    darkColor: params.darkColor ?? skinColors?.darkColor ?? '#000000',
    lightColor: params.lightColor ?? skinColors?.lightColor ?? '#ffffff',
  };
}
