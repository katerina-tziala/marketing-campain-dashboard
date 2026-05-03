const STABILITY_PENALTIES = new Map([
  ['preview', 3],
  ['experimental', 3],
  ['latest', 2],
  ['beta', 2],
])

export function stabilityPenaltyByModelId(id: string): number {
  const lower = id.toLowerCase()
  for (const [term, penalty] of STABILITY_PENALTIES) {
    if (lower.includes(term)) return penalty
  }
  return 0
}
