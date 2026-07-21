import { SeededRNG } from '../rng';

export function shuffleArray<T>(array: T[], rng?: SeededRNG): T[] {
  if (rng) return rng.shuffle(array);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
