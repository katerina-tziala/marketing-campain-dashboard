# Campaign Performance

Campaign Performance presents the active portfolio as an analytical view of campaign and channel results. It is responsible for turning imported campaign records into KPIs, filtered portfolio analysis, charts, and campaign detail tables.

The feature assumes campaign data has already passed ingestion validation. Its boundary starts at the active portfolio dataset and ends at performance summaries that users can inspect, filter, compare, and pass into downstream analysis features.

## Feature Responsibilities

Campaign Performance is responsible for:

- presenting the active portfolio's campaign and channel performance
- deriving portfolio-level KPIs from the current channel selection
- exposing channel filters that scope all visible metrics and charts
- preserving the unfiltered portfolio as the benchmark when filters are active
- grouping campaigns by channel for channel-level analysis
- surfacing campaign-level detail with sortable performance metrics
- providing consistent empty, filtered, and active-analysis states
- resetting view selection when the active portfolio changes

## Functional Requirements

- The system must display performance metrics for the active portfolio dataset
- The system must calculate aggregate budget, revenue, impressions, clicks, conversions, ROI, CTR, CVR, and CPA
- The system must group campaigns by channel and expose channel-level summaries
- Users must be able to filter the dashboard by one or more channels
- Channel filters must update KPIs, charts, and campaign tables consistently
- The unfiltered portfolio must remain available as the benchmark when a channel filter is active
- The system must classify campaigns and channels into performance groups for analysis
- The system must expose allocation imbalance between budget share and revenue share
- The system must handle an empty or missing active portfolio without producing invalid analytics state
- The system must reset channel filters when a new active portfolio is loaded

## Non-Functional Requirements

- Metric derivation must be deterministic for the same portfolio input
- Analytics state must be recomputed from source campaign data rather than mutated incrementally
- Ratio metrics must handle zero denominators safely
- Filtering must not mutate the underlying portfolio dataset
- Empty states must return safe defaults instead of throwing or producing misleading values
- Channel ordering and campaign ordering must remain stable for repeated renders
- The feature must avoid introducing new validation rules that belong to data ingestion
- Derived analysis must stay consistent across KPIs, charts, and tables for the same selected channels

## Processing Flow

1. The active portfolio provides campaign records that have already been validated by Data Transfer
2. Campaigns are transformed into performance records by calculating ROI, CTR, CVR, and CPA
3. Campaigns are grouped by normalized channel identity
4. Channel-level totals and performance metrics are calculated from their campaigns
5. Portfolio-level totals and KPIs are calculated from the active channel set
6. Campaign and channel summaries are enriched with budget share, revenue share, allocation gap, and efficiency gap
7. Campaigns and channels are classified into performance groups
8. Derived signals identify inefficiency, scaling opportunities, transfer candidates, concentration, and correlations
9. The current analysis state is exposed to KPIs, charts, and campaign detail views

## Feature Flow

The feature starts from the currently active portfolio. With no channel filter, all portfolio channels participate in the analysis and the dashboard represents the full dataset.

When a user selects channels, the feature recomputes the analysis from only those channels. The unfiltered portfolio remains available as a benchmark so filtered KPIs can be compared against the full portfolio baseline.

When every channel would be selected, the filter collapses back to the unfiltered state. This keeps "all channels" and "no filter" equivalent and avoids storing redundant filter state.

When a new portfolio is loaded, the active portfolio selection changes and channel filters reset. This prevents filters from a previous dataset from leaking into the new analysis.

## Visual Analysis Outputs

The feature presents several analytical views over the same filtered campaign set:

- ROI by channel: compares channel-level return against the active portfolio context
- Revenue vs budget by channel: compares spend, revenue, and allocation efficiency across channels
- ROI by campaign: ranks campaigns by return and highlights relative performance across the active selection
- Budget share by campaign: shows how spend is distributed across campaigns
- Conversion funnel: summarizes impressions, clicks, conversions, CTR, and CVR for the active selection
- Scaling opportunities: plots campaign ROI against budget to surface high-return, underfunded, and inefficient campaigns

The campaign detail table shows campaign name, channel, budget, clicks, impressions, CTR, conversions, CVR, revenue, CPA, and ROI. It defaults to revenue descending and supports sorting by every displayed column so users can inspect spend, volume, funnel efficiency, revenue, acquisition cost, and return from different angles.

## Analytical Rules

Campaign Performance does not own CSV or row validation. It relies on Data Transfer to prevent invalid campaign rows from entering the portfolio store.

Within this feature, processing rules protect analytical correctness:

- ROI is derived from revenue relative to budget, so campaigns require valid budget values before they reach this feature
- CTR is derived from clicks relative to impressions
- CVR is derived from conversions relative to clicks
- CPA is derived from budget relative to conversions
- Ratio metrics return unavailable values when their denominator is not usable
- Share-based analysis compares each campaign or channel against portfolio totals
- Allocation gap represents budget share minus revenue share
- Efficiency gap represents revenue share minus budget share

These rules keep charts and KPIs aligned with the same metric definitions used by downstream portfolio analysis.

## State Handling

- No active portfolio: the feature exposes empty analysis state and no campaign rows
- Active portfolio: all channels and campaigns are available, and unfiltered analysis uses the full dataset
- Filtered portfolio: selected channels define the active analysis scope while the full portfolio remains the benchmark
- New portfolio loaded: active portfolio updates and channel filters reset
- Portfolio removed: active portfolio and channel filters clear when the removed portfolio was selected

## Edge Cases

- No selected channels means all channels are included
- Selecting all available channels is treated the same as clearing the filter
- Missing channel IDs in filter state are ignored
- Empty channel selections produce safe empty analysis defaults
- Zero impressions, clicks, conversions, budget, or revenue can make ratio or share metrics unavailable
- Small datasets may not produce concentration or correlation signals because those signals require enough observations
- Micro-campaigns are guarded from being over-promoted by classification rules that require meaningful revenue or conversion volume
- Channel names are normalized for grouping so casing and spacing differences do not fragment the same channel

## Limitations

- Campaign Performance only analyzes the currently active portfolio
- The feature does not persist filter selections across portfolio replacement
- The feature does not validate raw CSV input or repair campaign data
- Channel filtering is inclusion-based; it does not support exclusion filters or saved filter presets
- Analysis is descriptive and comparative; it does not execute budget changes
- Classification and signal thresholds are fixed defaults, not user-configurable
- Correlation and concentration signals are limited by dataset size and should not be treated as causal proof
- The feature depends on browser-side computation for current portfolio analysis

## Future Improvements

- Persist channel filter state per portfolio
- Add saved filter presets for repeated analysis workflows
- Make classification and signal thresholds configurable by user or business context
- Add period comparison once multiple portfolio periods are available
- Add export support for filtered campaign tables and chart data
- Add explanatory drilldowns for classification groups and derived signals
- Add confidence indicators for signals that depend on small sample sizes
- Add tests covering filter transitions, empty analysis state, metric derivation, and benchmark behavior
