

const ALL_LABELS_KEY = 'all'


//  hash64 add import

export function getCacheKey(channelIds: string[], provider: string): string {
    const normalizedChannelIds = channelIds.length === 0 ? [ALL_LABELS_KEY] : channelIds.sort();

    const key = `${provider.toLowerCase()}::${normalizedChannelIds.join('|')}`

    return key
}