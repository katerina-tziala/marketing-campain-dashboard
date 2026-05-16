# Portfolio Analysis

The portfolio domain layer owns all metric computation, channel grouping, performance classification, and signal derivation that the rest of the system consumes. It has no framework dependencies and no UI knowledge. Three distinct consumers read from it — the portfolio store, the Campaign Performance feature, and the AI analysis prompts.

## Ownership

Campaign Performance, AI Analysis, and the portfolio store all need the same analytical output from the same campaign records. If this logic lived inside Campaign Performance, the other two would have to import across feature boundaries or duplicate computation. The layer lives in shared domain code and gives each consumer a stable, typed contract without knowing about each other.

The layer is pure domain logic. It takes typed inputs, returns typed outputs, and has no side effects. This makes it testable independently of stores, components, or provider calls.

## Computation Pipeline

Portfolio analysis is driven by a single entry point that accepts a set of selected channels. When the channel set is empty, the pipeline returns a zeroed result with the same structure as a populated one, so no downstream consumer needs to guard against null analysis state.

The pipeline runs in this order:

1. Aggregate raw KPIs across all selected channels
2. Map each campaign to a campaign summary, adding share efficiency fields
3. Compute per-campaign ROI baselines (average and median)
4. Map each channel to a channel summary, adding share efficiency and status fields
5. Derive channel context — top 5 channels by budget, top 5 by revenue
6. Classify campaigns and channels into labeled groups
7. Derive signals — actionable analytical observations
8. Return the complete analysis result

Steps 6 and 7 are independent of each other. Classification produces labeled display buckets. Signals produce actionable analysis inputs for the AI prompts.

## Metrics

Performance metrics are derived from raw campaign values. All four return null when the denominator is zero or the result is not finite. Zero denominators are expected — a campaign may have zero impressions, clicks, or conversions — and are treated as data, not errors.

| Metric | Formula |
| --- | --- |
| ROI | `(revenue − budget) / budget` |
| CTR | `clicks / impressions` |
| CVR | `conversions / clicks` |
| CPA | `budget / conversions` |

**Share efficiency** measures how a campaign or channel's budget and revenue shares compare at portfolio level.

| Field | Meaning |
| --- | --- |
| Budget share | `item.budget / totalBudget` |
| Revenue share | `item.revenue / totalRevenue` |
| Allocation gap | `budgetShare − revenueShare` — positive means overfunded relative to output |
| Efficiency gap | `revenueShare − budgetShare` — positive means revenue outperforms budget share |
| Gap amount | `item.revenue − item.budget` — absolute signed difference |

**Portfolio KPIs** aggregate all channel metrics into a single record, then derive portfolio-level ROI, CTR, CVR, and CPA from the aggregated totals. This is an aggregated view, not an average of per-channel ratios.

## Channel Grouping

Campaign records are grouped by a normalized channel identifier — lowercase, trimmed, hyphens replacing spaces. Each channel entry carries the aggregated raw metrics and derived performance metrics for all campaigns under that channel name.

Normalization ensures that channel names differing only in case or surrounding whitespace map to the same channel.

## Predicates

A shared set of stateless predicates is used by both the classification and signal layers. They accept threshold arguments rather than embedding constants, so both callers can pass different values without duplicating logic.

| Check | Condition |
| --- | --- |
| ROI above portfolio | Item ROI exceeds portfolio ROI, or true when portfolio ROI is null |
| ROI below portfolio | Item ROI is below portfolio ROI, treating null as zero |
| Minimum budget share | Item budget share meets or exceeds a threshold |
| Minimum revenue share | Item revenue share meets or exceeds a threshold |
| Budget share lead | Allocation gap (budgetShare − revenueShare) exceeds a minimum gap |
| Revenue share lead | Efficiency gap (revenueShare − budgetShare) exceeds a minimum gap |
| Overfunded underperformer | Minimum budget share AND budget share lead AND ROI below portfolio |
| Underfunded outperformer | Minimum revenue share AND revenue share lead AND ROI above portfolio |

Additional predicates used only by the classification layer:

| Check | Condition |
| --- | --- |
| Funnel leak | CTR above median CTR times a watch factor AND CVR below median CVR times a watch factor |
| Positive underperforming ROI | ROI at or above zero AND below portfolio ROI scaled by a watch factor |
| ROI above portfolio by factor | Item ROI exceeds portfolio ROI scaled by a configurable factor |

## Classification

Classification assigns each campaign and channel to exactly one of four labeled groups. The groups are display labels that communicate relative performance — they do not drive recommendation logic directly.

### Campaign groups

Campaigns are tested in priority order and placed in the first group whose conditions match. A campaign that matches no group is excluded from all groups.

| Group | Condition |
| --- | --- |
| **Top** | ROI above portfolio by a top factor, revenue at or above a dynamic floor, conversions at or above a dynamic floor |
| **Opportunity** | ROI at or above portfolio AND revenue share at or above budget share |
| **Bottom** | Minimum budget share AND budget share leads revenue share by the gap threshold AND ROI below portfolio |
| **Watch** | Funnel leak OR positive ROI that lags the portfolio by a watch factor |

The dynamic revenue and conversion floors for the Top group are derived from the portfolio totals: the floor is the larger of a portfolio-share fraction (2% of total revenue or conversions by default) and a hard minimum (€50 or 2 conversions). This prevents micro-campaigns with small denominators from entering the Top group based on inflated ratios.

Groups are ranked before return: Top and Opportunity by ROI descending, Bottom by allocation gap descending, Watch by budget share descending.

### Channel groups

Channels are tested in the same priority cascade, with channel-specific labels.

| Group | Condition |
| --- | --- |
| **Strong** | ROI above portfolio by a top factor AND revenue share at or above budget share |
| **Opportunity** | ROI at or above portfolio AND revenue share at or above budget share |
| **Weak** | Budget share leads revenue share by the gap threshold AND ROI below portfolio |
| **Watch** | Funnel leak OR positive ROI that lags the portfolio by a watch factor |

Channels do not have a dynamic size gate because channels are aggregates; the noise problem that affects micro-campaigns does not apply at channel level.

### Threshold separation

Classification thresholds are structurally separate from signal thresholds. Adjusting a classification boundary — which display label is applied to an item — must not change which signal or recommendation is generated. The two threshold trees are tuned independently.

## Signals

Signals are derived analytical observations about the portfolio — items that represent a meaningful actionable pattern rather than a display label. They are the primary data source for AI prompt inputs.

### Inefficient channels

Channels where budget share leads revenue share by at least the gap threshold and ROI is below the portfolio average. Only channels above a minimum budget share threshold are evaluated, so small allocations with noisy ratios are excluded. Results are ranked by allocation gap descending.

### Inefficient campaigns

Campaigns where budget share leads revenue share by the gap threshold and ROI is below the portfolio average. Each result includes a maximum reducible budget estimate — capped at 50% of the campaign budget by default. This value feeds the transfer signal computation. Results are ranked by allocation gap descending.

### Budget scaling candidates

Campaigns with ROI above the portfolio average and revenue share leading budget share. These are candidates for receiving redirected budget. Each result includes a maximum additional budget estimate (campaign budget multiplied by a configurable fraction, capped at 2× by default) and an expected ROI retention factor (85% by default — ROI is assumed to decay slightly when extra budget is added). Results are ranked by ROI descending.

### Transfer candidates

Derived from the intersection of inefficient campaigns and budget scaling candidates. Each inefficient source campaign is paired with each scaling target (excluding self-pairs) and a budget shift range is computed. The minimum shift is the larger of a hard floor (€50 by default) or a fraction of the reducible budget. The maximum shift is bounded by both the source's reducible budget and the target's additional budget capacity. A pair is included only when the range is non-trivial — maximum must exceed minimum. Results are ranked by maximum shift descending and capped at 5.

### Scaling opportunities

A merged list of campaign-level and channel-level scaling signals. Campaign signals require ROI above portfolio, revenue share above budget share, and minimum absolute size. Channel signals require the underfunded outperformer condition. The merged list is ranked by ROI descending and capped at 5. This list surfaces high-return, under-invested items for AI analysis.

### Revenue concentration

Measures revenue concentration across campaigns using the top-1 and top-3 revenue share values. Thresholds distinguish three levels.

| Level | Condition |
| --- | --- |
| **High** | Top-1 campaign holds more than 40% of revenue, or top 3 hold more than 75% |
| **Moderate** | Top-1 campaign holds more than 25% of revenue, or top 3 hold more than 60% |
| **Low** | Neither High nor Moderate threshold is met |

Requires at least 3 campaigns. Returns a non-flagged Low result when the dataset is too small.

### Correlations

Not yet implemented. The signal shape and output contract are defined so that AI prompts and the derived signals structure do not need to change when the logic is added. The output is always an empty array.

### Threshold separation

Signal thresholds are separate from classification thresholds by design. Classification thresholds control which display label is applied to an item. Signal thresholds control which patterns are considered actionable and exposed to downstream consumers.

## Ranking

All result lists produced by the classification and signal layers are ranked at the point of construction, not at the point of display. Consumers can safely slice the top N items from any result list without implementing their own ordering logic.

Each result list is ranked by the field most relevant to its purpose: ROI for performance comparisons, allocation gap for inefficiency detection, budget share for watch candidates, and maximum shift for transfer prioritization.

## Analysis Output

The full analysis result contains the following outputs.

| Output | Contents |
| --- | --- |
| Portfolio summary | Aggregated KPIs plus campaign and channel counts, and per-campaign ROI baselines |
| Channel summaries | One entry per selected channel, with share efficiency and status |
| Channel context | Top 5 channels by budget, top 5 by revenue |
| Campaign groups | Four classification buckets: Top, Opportunity, Bottom, Watch |
| Channel groups | Four classification buckets: Strong, Opportunity, Weak, Watch |
| Derived signals | Inefficient channels, inefficient campaigns, budget scaling candidates, transfer candidates, scaling opportunities, concentration flag, and correlations |

## Consumers

Three distinct parts of the system read from the portfolio domain layer.

The **portfolio store** runs the full pipeline once when a portfolio is loaded. The result is stored on the portfolio entity and reused directly when no channel filter is active.

The **Campaign Performance feature** re-runs the pipeline when channel filters are active, passing only the selected channels. It returns the stored result directly when no filter is active to avoid recomputation.

The **AI analysis prompts** read the analysis result from the context object pushed by the dashboard orchestrator. They use campaign groups, channel groups, derived signals, and portfolio KPIs to build both the Executive Summary and Budget Optimization prompts.

## Limitations

- Threshold values are fixed defaults. There is no user-configurable threshold surface at runtime.
- Correlation signals are not implemented. The output is always an empty array.
- All computation runs on the main thread. For the current 2 MB CSV size limit this is acceptable. If that limit increases significantly, the analysis pipeline should move to a Web Worker.
- Signal lists are capped at fixed counts (5 scaling opportunities, 5 transfer candidates). The caps serve AI prompt size and UI scanability.
- The domain layer has no tests. Its pure, deterministic structure makes it well-suited for unit testing.

## Future Improvements

- Add unit tests for metric formulas, classification predicates, signal derivation, and threshold edge cases
- Implement pairwise correlation signals
- Add configurable threshold profiles (conservative vs. aggressive signal sensitivity)
- Move the analysis pipeline to a Web Worker if CSV size limits increase
- Add period-comparison support once multiple portfolio time ranges are available
