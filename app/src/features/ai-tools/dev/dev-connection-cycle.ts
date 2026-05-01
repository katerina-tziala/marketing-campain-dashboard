// TODO: [DEV ONLY] Remove this entire file before shipping to production

import type { AiErrorCode, AiProviderType } from '@/features/ai-tools/types'
import type { AiModel } from '@/features/ai-tools/providers/types'
import { setDevConnectOverride } from '@/features/ai-tools/ai-connection/stores'

// ── Sequence ──────────────────────────────────────────────────────────────────
//
// Each Connect click advances one step through every connection-phase AiErrorCode.
// Success is intentionally absent — the form never disconnects mid-cycle, so the
// apiKey stays in the input and the developer can just keep clicking.
// (parse-error / min-campaigns / token-limit are analysis-only — omitted.)

const CONNECTION_SEQUENCE: AiErrorCode[] = [
  'invalid-key',
  'network',
  'timeout',
  'rate-limit',
  'server-error',
  'no-models',
  'invalid-response',
  'unknown',
]

// ── Counter (module-level, resets on activate) ────────────────────────────────

let counter = 0

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Override function (replaces connectProvider in aiConnection.store) ─────────

async function runDevConnect(_provider: AiProviderType): Promise<AiModel[]> {
  await sleep(1500) // simulate network latency — spinner visible during this time

  const code = CONNECTION_SEQUENCE[counter]
  counter = (counter + 1) % CONNECTION_SEQUENCE.length

  throw new Error(code)
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
