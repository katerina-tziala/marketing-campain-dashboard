import XXH from 'xxhashjs'

const ALL_LABELS_KEY = 'all'
const HASH_SEED = 0

export function getCacheKey(channelIds: string[], provider: string): string {
  const normalizedChannelIds = channelIds.length === 0 ? [ALL_LABELS_KEY] : channelIds.sort()
  const raw = `${provider.toLowerCase()}::${normalizedChannelIds.join('|')}`
  return XXH.h64(raw, HASH_SEED).toString(16)
}
