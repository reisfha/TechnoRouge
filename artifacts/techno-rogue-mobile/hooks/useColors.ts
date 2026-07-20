import { Colors } from '@/constants/colors';

/**
 * Returns the TechnoRogue design tokens.
 * The game uses a single dark cyberpunk palette, so this is a simple
 * pass-through. Kept as a hook so screens can swap palettes later.
 */
export function useColors() {
  return Colors;
}
