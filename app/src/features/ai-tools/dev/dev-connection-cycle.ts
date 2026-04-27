// TODO: [DEV ONLY] Remove this entire file before shipping to production

import type { AiErrorCode, AiProviderType } from '@/features/ai-tools/types'
import type { AiModel } from '@/features/ai-tools/providers/types'
import { useAiConnectionStore, setDevConnectOverride } from '@/features/ai-tools/ai-connection/stores/aiConnection.store'

// ── Fake model ────────────────────────────────────────────────────────────────

const DEV_MODEL: AiModel = {
  id: 'llama-3.3-70b-versatile',
  displayName: 'Llama 3.3 70B (dev)',
  family: 'Llama',
  strength: 'High-quality reasoning with detailed analytical depth',
  strengthScore: 9,
  reason: 'Dev fake model — no API calls are made',
  limitReached: false,
}

// ── Sequence types ────────────────────────────────────────────────────────────

type SuccessOutcome = { kind: 'success' }
type ErrorOutcome  = { kind: 'error'; code: AiErrorCode }
type ConnectionOutcome = SuccessOutcome | ErrorOutcome

// ── Sequence ──────────────────────────────────────────────────────────────────
//
// Success fires first so the connected state is immediately visible.
// After 1.5 s the store auto-disconnects so the cycle can continue on the
// next Connect click. Every AiErrorCode reachable during connection follows.
// (parse-error / min-campaigns / token-limit are analysis-only — omitted.)

const CONNECTION_SEQUENCE: ConnectionOutcome[] = [
  { kind: 'success' },
  { kind: 'error', code: 'invalid-key' },
  { kind: 'error', code: 'network' },
  { kind: 'error', code: 'timeout' },
  { kind: 'error', code: 'rate-limit' },
  { kind: 'error', code: 'server-error' },
  { kind: 'error', code: 'no-models' },
  { kind: 'error', code: 'invalid-response' },
  { kind: 'error', code: 'unknown' },
]

// ── Counter (module-level, resets on activate) ────────────────────────────────

let counter = 0

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function scheduleAutoDisconnect(): void {
  setTimeout(() => useAiConnectionStore().disconnect(), 4000)
}

// ── Override function (replaces connectProvider in aiConnection.store) ─────────

async function runDevConnect(_provider: AiProviderType): Promise<AiModel[]> {
  await sleep(1500) // simulate network latency — spinner visible during this time

  const outcome = CONNECTION_SEQUENCE[counter]
  counter = (counter + 1) % CONNECTION_SEQUENCE.length

  if (outcome.kind === 'error') throw new Error(outcome.code)

  scheduleAutoDisconnect()
  return [{ ...DEV_MODEL }]
}

// ── Public API ────────────────────────────────────────────────────────────────

export function useDevConnectionCycle() {
  function activate(): void {
    counter = 0
    setDevConnectOverride(runDevConnect)
  }

  function deactivate(): void {
    setDevConnectOverride(null)
  }

  return { activate, deactivate }
}
