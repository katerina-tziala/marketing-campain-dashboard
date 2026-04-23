import { PROVIDER_LABELS } from "../../ai-connection/utils"
import { generateModelEvaluationPrompt } from "../../prompts"
import type { AiModel, ModelsResponse } from "../../types"
import { buildFallbackModel, parseJsonResponse, rankModels } from "../utils/shared"
import { fetchGroqModels, requestGroqChatCompletion } from "./api"
import type { GroqModel } from "./types"

function filterModels(models: GroqModel[]): GroqModel[] {
    const banned = [
        "whisper",
        "audio",
        "guard",
        "safeguard",
        "moderation",
        "orpheus", // guarded
    ]

    return models.filter((m) => {
        const id = (m.id || '').toLowerCase()

        return !banned.some((x) => id.includes(x))
    })
}

function getOptimalModel(models: GroqModel[]): string {
    const sorted = [...models].sort((a, b) => b.created - a.created)
    return sorted[0]?.id ?? ''
}

export async function connectGroq(apiKey: string): Promise<AiModel[]> {
    const models = await fetchGroqModels(apiKey)
    const filteredModels = filterModels(models)

    if (filteredModels.length === 0) {
        throw new Error('no-models')
    }

    // TODO: iterate on multiple models if call fails, rather than just picking the optimal and falling back to it if the evaluation fails. 
    // This would require changes to the prompt and response parsing to identify which model failed, 
    // but would allow for better resilience in the case of transient errors or rate limits.
    const optimal = getOptimalModel(filteredModels)
    const fallback = buildFallbackModel(optimal, PROVIDER_LABELS.groq)

    try {
        console.log('filtered models', filteredModels);

        // TODO: consider whether we want to include more info in the prompt, such as model capabilities or strengths (currently we just include the model IDs).
        // This would require changes to the prompt template and response parsing, 
        // but could potentially lead to better model selection by providing more context to the AI.
        // customize prompt to DTO of provider
        const prompt = generateModelEvaluationPrompt(filteredModels)

        console.log(prompt);

        const raw = await requestGroqChatCompletion(apiKey, prompt, optimal)
        // TODO: add 'invalid-response' to error handling, and handle it in the UI by falling back to the optimal model without showing an error (since the evaluation is a "nice to have" rather than a requirement, and an invalid response shouldn't block the user from using the tool with the optimal model).
    
        const parsed = parseJsonResponse<ModelsResponse>(raw)
        return rankModels(parsed.models, fallback)
    } catch {
        // AI selection failed — fall back to optimal model
        return [fallback]
    }

}

