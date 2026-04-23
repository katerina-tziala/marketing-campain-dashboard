import type { AiModel } from "../types"

export function parseJsonResponse<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim()
  return JSON.parse(cleaned)
}

export function toValidModels(validIds: Set<string>, parsed: AiModel[]): AiModel[] {
  const valid = parsed.filter((m) => validIds.has(m.id))
  if (valid.length === 0) throw new Error('no-models')
  return valid
}
