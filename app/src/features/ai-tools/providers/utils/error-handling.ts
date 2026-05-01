import type { AiErrorCode } from '../../types'

const TOKEN_LIMIT_PATTERNS = [
    'resource_exhausted',
    'rate_limit',
    'quota',
    'tokens',
    'too many requests',
]

function isTokenLimitError(status: number, body: string): boolean {
    if (status === 429) return true
    const lower = body.toLowerCase()
    return TOKEN_LIMIT_PATTERNS.some((p) => lower.includes(p))
}


export function normalizeConnectionError(error: unknown): Error {
    if (error instanceof TypeError) {
        return new Error('network')
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
        return new Error('timeout')
    }

    return error instanceof Error ? error : new Error('unknown')
}

export function errorCodeFromStatus(status: number): AiErrorCode {
    if (status === 400 || status === 401 || status === 403) return 'invalid-key'
    if (status === 429) return 'rate-limit'
    if (status >= 500) return 'server-error'
    return 'unknown'
}

export async function assertResponseOk(
    response: Response,
): Promise<void> {
    if (!response.ok) {
        throw new Error(errorCodeFromStatus(response.status))
    }
    return
}

export async function assertChatResponseOk(
    response: Response,
): Promise<void> {
    if (response.ok) return

    const responseText = await response.text().catch(() => '')

    if (isTokenLimitError(response.status, responseText)) {
        throw new Error('token-limit')
    }

    throw new Error(errorCodeFromStatus(response.status))
}