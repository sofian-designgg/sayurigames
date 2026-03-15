// Récompenses Sayucoins par difficulté (pas trop généreux pour garder la valeur des rôles)

export type Difficulty = 'facile' | 'moyen' | 'difficile';

export const REWARDS: Record<Difficulty, { min: number; max: number }> = {
  facile: { min: 5, max: 15 },
  moyen: { min: 20, max: 45 },
  difficile: { min: 50, max: 120 },
};

export function getReward(difficulty: Difficulty): number {
  const { min, max } = REWARDS[difficulty];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
