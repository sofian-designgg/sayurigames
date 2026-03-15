// Hiérarchie des rôles (1 = le plus rare, 6 = le plus commun)
// Pourcentages: 1: 1%, 2: 3%, 3: 6%, 4: 12%, 5: 20%, 6: 28%, Rien: 30%

export const ROULETTE_COST = 1000;

export const ROULETTE_ROLES: { roleId: string; chance: number; tier: number }[] = [
  { roleId: '1479163259297861845', chance: 1, tier: 1 },
  { roleId: '1478138748616052756', chance: 3, tier: 2 },
  { roleId: '1478480011303452735', chance: 6, tier: 3 },
  { roleId: '1470854476859441242', chance: 12, tier: 4 },
  { roleId: '1477763567167082506', chance: 20, tier: 5 },
  { roleId: '1477766282299572254', chance: 28, tier: 6 },
];

const TOTAL_CHANCE = ROULETTE_ROLES.reduce((s, r) => s + r.chance, 0); // 70%, 30% = rien

export function spinRoulette(): { roleId: string; tier: number } | null {
  const rand = Math.random() * 100;
  let acc = 0;
  for (const r of ROULETTE_ROLES) {
    acc += r.chance;
    if (rand < acc) return { roleId: r.roleId, tier: r.tier };
  }
  return null; // pas de rôle gagné
}
