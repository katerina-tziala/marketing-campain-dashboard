# AI Connection

AI Connection connects the dashboard to a user-provided AI provider account and prepares a ranked set of compatible models for AI analysis features. Its boundary starts with provider selection and an API key, and ends with a connected provider state, selected model, and model availability metadata used by Executive Summary and Budget Optimization.

The feature does not own analysis prompts or portfolio interpretation. It owns provider connectivity, model discovery, local candidate preparation, model suitability evaluation, connection state, and safe disconnect behavior.

## Supported Providers

The feature currently supports:

- Google Gemini
- Groq

Both providers require a user-supplied API key. Provider-specific instructions are shown during connection, but the system treats provider credentials as session connection input rather than portfolio data.

Supported providers must be able to expose compatible text-generation models and accept text prompts for model evaluation and downstream AI analysis.

## Feature Responsibilities

AI Connection is responsible for:

- accepting a supported provider and API key
- validating that an API key is present before attempting connection
- checking that the selected provider can be reached with the supplied key
- discovering provider models and preparing compatible candidates for evaluation
- evaluating and ranking prepared candidates for Marketing Intelligence Dashboard use cases
- selecting the strongest available model for downstream AI requests
- tracking model availability when provider limits are reached
- exposing connected, connecting, error, exhausted, and disconnected states
- clearing connection and analysis state when the user disconnects

## Functional Requirements

- Users must be able to connect using Google Gemini or Groq
- Users must provide an API key before a connection attempt can start
- The system must discover, evaluate, and rank compatible provider models before enabling AI analysis
- The system must select the strongest ranked model by default
- The system must block AI evaluation when no provider, API key, selected model, or available model exists
- The system must expose connection errors with actionable user-facing messages
- The system must allow users to disconnect from the current provider
- Disconnecting must clear provider state and AI analysis state

## Non-Functional Requirements

- Local candidate filtering and sorting must be deterministic for the same provider response inputs
- Model selection must prefer production-suitable text models over unsupported, non-text, or unstable candidates
- Provider errors must be normalized into stable application error categories
- Failed connection attempts must not leave the app in a partially connected state
- API keys must not be written into portfolio data or analysis outputs
- AI analysis must not run until connection and model selection have completed
- Model-limit fallback must avoid retrying exhausted models in the same connection session
- Disconnection must leave no selected model available for downstream requests

## Processing Flow

1. The user selects a supported provider and supplies an API key
2. The system validates that the API key is present
3. The provider connection process fetches the provider's available model list
4. Provider models are converted into application-level model candidates
5. Candidates are filtered and sorted locally before AI evaluation
6. The prepared candidate list is sent to the model evaluation prompt
7. Model evaluation ranks candidate suitability for downstream dashboard tasks
8. The strongest usable ranked model becomes the selected model
9. Connected state is exposed to AI analysis features
10. If connection fails, the error is normalized and the app remains disconnected

## Model Selection Flow

Model selection is part of connection, not a separate user workflow. The system uses a two-stage flow: deterministic local candidate preparation followed by AI-based suitability evaluation.

Provider discovery runs first with the user-supplied API key. Returned provider models are normalized into application-level candidates, so the evaluation prompt receives compact fields such as provider, identifier, text-generation support, context capacity, output capacity, and reasoning-related metadata when available.

Local preparation removes candidates that are known to be incompatible before prompt evaluation. For Gemini, the local filter keeps models that support text generation through `generateContent` and excludes identifiers containing unsupported terms such as `embedding`, `image`, `audio`, `tts`, `veo`, `imagen`, `lyria`, and `robotics`.

The remaining compatible candidates are sorted locally before AI evaluation. The ordering favors thinking-capable models, larger context windows, larger output limits, lower stability risk, and newer versions. This sort is deterministic and establishes the order in which candidate models may be used to run the evaluation request if earlier candidates fail.

The model evaluation prompt then ranks the already prepared candidate list for Marketing Intelligence Dashboard workloads. This AI-based ranking determines final model suitability rather than repeating provider discovery or raw compatibility filtering.

The model evaluation criteria prioritize:

- analytical reasoning quality
- structured JSON reliability
- summarization quality
- budget optimization suitability
- consistency across repeated requests
- stable identifiers and expected usage sustainability
- useful context and output capacity

Low-suitability models may be excluded from the ranked output by the evaluation step. The strongest usable ranked model is selected by default. If a selected model later reaches a provider limit, it is marked unavailable and the system attempts to move to the next available ranked model.

If all compatible models are exhausted or no compatible models are found, AI evaluation is disabled until the user reconnects, waits for provider limits to reset, or switches provider.

## Feature Flow

Before connection, the AI panel shows provider selection, API key entry, provider-specific setup guidance, and any validation or connection errors.

During connection, the feature enters a connecting state and disables duplicate connection attempts. The app only becomes connected after model discovery and model ranking produce at least one usable model.

After connection, the app exposes provider status and enables AI analysis features that depend on a selected model. The selected model is used for downstream prompts until it becomes unavailable or the user disconnects.

On disconnect, provider state, API key state, model state, and AI analysis state are cleared. The next connection starts from a clean disconnected state.

## Validation Logic

AI Connection validates connection readiness and model suitability, not portfolio data.

- Provider must be one of the supported providers
- API key is required before connection
- Provider model lists must yield at least one compatible prepared candidate
- Model identifiers returned by model evaluation must match identifiers from the provider model list
- Duplicate model entries are not allowed in the selected ranked model set
- Model evaluation must return at least one usable ranked model before analysis can run
- Exhausted models are skipped for future requests within the same connection session

These rules protect downstream AI tools from running with missing credentials, unsupported models, weak models, or stale model availability assumptions.

## State Handling

- Disconnected: no provider, API key, selected model, or model list is available
- Connecting: provider validation and model selection are in progress
- Connected: provider, API key, ranked model list, and selected model are available
- Connection error: provider setup failed and the app remains disconnected
- Selected model exhausted: the current model is marked unavailable and the next available model can be selected
- All models exhausted: AI evaluation is disabled until the connection state changes
- Panel closed: transient form state resets while the connection state is preserved if already connected
- Disconnected by user: connection state and AI analysis state are cleared

## Edge Cases

- Empty API key input blocks connection before any provider request is made
- Invalid, expired, or revoked API keys are surfaced as credential errors
- Network failures, timeouts, provider rate limits, provider server errors, invalid responses, and parse failures are normalized into application error categories
- Provider accounts may return no compatible text models
- Provider accounts may expose models that require additional terms or access approval
- A model may become unavailable after connection because of quota, token, or rate limits
- If a selected model reaches a limit, the system should prefer the next available ranked model before failing the analysis workflow
- If every model is exhausted, analysis remains disabled rather than repeatedly retrying failing models
- Closing and reopening the AI panel should not preserve stale form errors for a disconnected form

## Limitations

- Only Google Gemini and Groq are supported
- API keys are supplied directly by the user; there is no OAuth flow
- Provider requests are made from the browser session
- Connection state is session-scoped and not designed as durable credential storage
- Model ranking depends on provider model metadata and model-evaluation output
- The system does not let users manually choose from the ranked model list
- Provider-specific model access policies may still prevent use of otherwise compatible models
- The feature does not manage billing, quotas, organization permissions, or provider account setup

## Future Improvements

- Add manual model selection from the ranked compatible model list
- Persist provider preference without persisting secret credentials
- Add provider-specific quota and access diagnostics
- Add support for additional AI providers
- Add credential storage through a secure backend or key vault
- Add connection test history for debugging provider failures
- Add retry and timeout controls for slow provider responses
- Add tests covering provider errors, no-models responses, model exhaustion, disconnect cleanup, and model ranking behavior
