import type { AiAnalysisType, AiErrorCode } from '@/features/ai-tools/types'
import type { AiModel } from '@/features/ai-tools/providers/types'
import type { AnalysisResponse } from '@/features/ai-tools/ai-analysis/types'
import { useAiConnectionStore } from '@/features/ai-tools/ai-connection/stores'
import { useAiAnalysisStore } from '@/features/ai-tools/ai-analysis/stores'
import { BUDGET_OPTIMIZER_MOCKS } from '@/features/ai-tools/mocks/budget-optimizer-mocks'
import { EXECUTIVE_SUMMARY_MOCKS } from '@/features/ai-tools/mocks/executive-summary-mocks'
import { setAnalysisPromptRunnerOverride } from '@/features/ai-tools/ai-analysis/utils/analysis-prompt'

// ── Fake model ────────────────────────────────────────────────────────────────

const DEV_GROQ_MODEL: AiModel = {
  id: 'llama-3.3-70b-versatile',
  displayName: 'Llama 3.3 70B (dev)',
  family: 'Llama',
  strength: 'High-quality reasoning with detailed analytical depth',
  strengthScore: 9,
  reason: 'Dev fake model — no API calls are made',
  limitReached: false,
}

// ── Sequence types ────────────────────────────────────────────────────────────

type MockEntry = { kind: 'mock'; response: AnalysisResponse }
type ErrorEntry = { kind: 'error'; code: AiErrorCode }
type DevEntry = MockEntry | ErrorEntry

// ── Cycles ────────────────────────────────────────────────────────────────────
//
// Pattern per tab: mocks interleaved with every distinct error code.
// Errors that share the same display message are still included separately
// so every AiErrorCode reachable from runAnalysisPrompt is exercised.
//
// token-limit is included and auto-resets after 100 ms so the cycle
// can continue without a manual disconnect/reconnect.

const BUDGET_SEQUENCE: DevEntry[] = [
  { kind: 'mock',  response: BUDGET_OPTIMIZER_MOCKS[0] },
  { kind: 'mock',  response: BUDGET_OPTIMIZER_MOCKS[1] },
  { kind: 'error', code: 'min-campaigns' },
  { kind: 'error', code: 'network' },
  { kind: 'mock',  response: BUDGET_OPTIMIZER_MOCKS[2] },
  { kind: 'error', code: 'rate-limit' },
  { kind: 'mock',  response: BUDGET_OPTIMIZER_MOCKS[3] },
  { kind: 'error', code: 'server-error' },
  { kind: 'mock',  response: BUDGET_OPTIMIZER_MOCKS[4] },
  { kind: 'error', code: 'timeout' },
  { kind: 'error', code: 'parse-error' },
  { kind: 'error', code: 'invalid-response' },
  { kind: 'error', code: 'invalid-key' },
  { kind: 'error', code: 'no-models' },
  { kind: 'error', code: 'unknown' },
  { kind: 'error', code: 'token-limit' }, // terminal — button disabled after this; disconnect to reset
]

const SUMMARY_SEQUENCE: DevEntry[] = [
  { kind: 'mock',  response: EXECUTIVE_SUMMARY_MOCKS[0] },
  { kind: 'mock',  response: EXECUTIVE_SUMMARY_MOCKS[1] },
  { kind: 'error', code: 'network' },
  { kind: 'mock',  response: EXECUTIVE_SUMMARY_MOCKS[2] },
  { kind: 'error', code: 'rate-limit' },
  { kind: 'mock',  response: EXECUTIVE_SUMMARY_MOCKS[3] },
  { kind: 'error', code: 'server-error' },
  { kind: 'mock',  response: EXECUTIVE_SUMMARY_MOCKS[4] },
  { kind: 'error', code: 'timeout' },
  { kind: 'error', code: 'parse-error' },
  { kind: 'error', code: 'invalid-response' },
  { kind: 'error', code: 'invalid-key' },
  { kind: 'error', code: 'no-models' },
  { kind: 'error', code: 'unknown' },
  { kind: 'error', code: 'token-limit' }, // terminal — button disabled after this; disconnect to reset
]

const SEQUENCES: Record<AiAnalysisType, DevEntry[]> = {
  budgetOptimizer: BUDGET_SEQUENCE,
  executiveSummary: SUMMARY_SEQUENCE,
}

// ── Per-tab counters (module-level, independent per tab) ──────────────────────

const counters: Record<AiAnalysisType, number> = {
  budgetOptimizer: 0,
  executiveSummary: 0,
}

function resetCounters(): void {
  counters.budgetOptimizer = 0
  counters.executiveSummary = 0
}

function nextEntry(type: AiAnalysisType): DevEntry {
  const seq = SEQUENCES[type]
  const entry = seq[counters[type]]
  counters[type] = (counters[type] + 1) % seq.length
  return entry
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ── Override function (replaces runProviderPrompt in analysis-prompt.ts) ──────

async function runDevCycle(type: AiAnalysisType, signal: AbortSignal): Promise<AnalysisResponse | null> {
  await sleep(2000)
  if (signal.aborted) return null

  const entry = nextEntry(type)

  if (entry.kind === 'mock') {
    return { ...entry.response, timestamp: Date.now() }
  }

  // Bypass the store's stale-result cache fallback so the error notification actually shows.
  // handleRequestError would silently replace the error with a cached mock result, so we
  // write the error state directly via $patch before returning null to exit cleanly.
  useAiAnalysisStore().$patch(state => {
    const display = { status: 'error' as const, response: null, error: { code: entry.code }, notice: null }
    if (type === 'budgetOptimizer') state.budgetOptimizer = display
    else state.executiveSummary = display
  })
  return null
}

// ── Public API ────────────────────────────────────────────────────────────────

export function devConnect(): void {
  const store = useAiConnectionStore()
  const model = { ...DEV_GROQ_MODEL, limitReached: false }
  store.$patch({
    provider: 'groq',
    apiKey: 'dev-fake-key',
    isConnected: true,
    isConnecting: false,
    connectionError: null,
    models: [model],
    selectedModel: model,
  })
  resetCounters()
}

export function devDisconnect(): void {
  setAnalysisPromptRunnerOverride(null)
  const store = useAiConnectionStore()
  store.disconnect()
}

export function useDevAnalysisCycle() {
  function activate(): void {
    devConnect()
    setAnalysisPromptRunnerOverride(runDevCycle)
  }

  function deactivate(): void {
    devDisconnect()
  }

  return { activate, deactivate }
}
