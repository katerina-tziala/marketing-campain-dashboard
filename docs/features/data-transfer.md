# Data Transfer

Data Transfer ingests campaign performance CSV files and converts them into the dashboard's active `PortfolioInput`. It is the ingestion boundary between external marketing data and the app's portfolio analysis, charts, KPIs, and AI tools.

The feature validates structure and metrics before data enters the portfolio store. It also provides a downloadable sample CSV so users can start from the expected format.

## Feature Responsibilities

Data Transfer is responsible for:

- accepting campaign CSV uploads
- validating file structure and campaign metrics
- preventing invalid analytics input from entering the portfolio store
- detecting duplicate campaign/channel pairs
- supporting partial imports with validation review
- replacing the active portfolio dataset when a new upload is confirmed

CSV processing happens in the browser. Valid rows become campaign records, invalid rows are retained as structured validation errors, and duplicate candidates are grouped for explicit resolution before import.

## Validation Pipeline

1. File validation rejects non-CSV files and files larger than 2 MB before parsing
2. CSV parsing reads header-based rows and skips empty lines
3. Header validation checks for the required campaign columns using trimmed, case-insensitive header names
4. Row normalization trims string fields and coerces numeric metrics into typed values
5. Row validation separates valid campaign rows from structured row errors
6. Duplicate detection groups valid rows by normalized campaign name and channel

Validation returns valid, non-duplicate campaign rows together with structured validation errors. Errors may come from file constraints, parsing, missing headers, invalid rows, or duplicate groups.

## Functional Requirements

- Users must be able to upload campaign data using CSV files
- The system must validate uploaded files before importing campaign data
- The system must reject unsupported file types and files larger than 2 MB
- The system must validate required campaign metrics and funnel relationships
- The system must prevent invalid rows from entering the portfolio store
- The system must detect duplicate campaign/channel pairs within the uploaded file
- Users must be able to review validation issues before import
- Users must be able to import valid rows even when some rows fail validation
- Users must confirm before replacing an existing portfolio dataset
- The system must provide a downloadable CSV template

## Non-Functional Requirements

- CSV processing must happen entirely in the browser
- Validation must complete before imported data becomes available to analytics features
- Invalid campaign rows must never enter derived analytics state
- Duplicate detection must use deterministic normalization rules
- Imports must remain responsive for files up to 2 MB
- Validation feedback must identify invalid rows and associated issues
- Import behavior must be deterministic for identical input files
- Upload replacement must fully reset the active portfolio analysis state

## Upload Flow

Users provide portfolio metadata and upload a CSV file. Metadata is captured once per report and includes the report name, reporting period, and optional industry context.

Successful imports emit a finalized portfolio payload. The portfolio store creates the portfolio entry, rebuilds derived channel mappings, and recomputes portfolio analysis state. Imports either initialize the first portfolio or replace the existing one.

Replacement is intentional: when a portfolio already exists, the user must confirm before a new upload can replace the current dataset and reset active analysis.

## CSV Format

CSV files must include these headers:

```csv
campaign,channel,budget,impressions,clicks,conversions,revenue
```

Headers are matched case-insensitively and trimmed before lookup. Extra columns are ignored.

| Column        | Type    | Rules                                                                   |
| ------------- | ------- | ----------------------------------------------------------------------- |
| `campaign`    | string  | Required. Must not be empty, `undefined`, or `null`.                    |
| `channel`     | string  | Required. Must not be empty, `undefined`, or `null`.                    |
| `budget`      | number  | Required. Must be greater than 0.                                       |
| `impressions` | integer | Required. Must be a non-negative integer.                               |
| `clicks`      | integer | Required. Must be a non-negative integer and cannot exceed impressions. |
| `conversions` | integer | Required. Must be a non-negative integer and cannot exceed clicks.      |
| `revenue`     | number  | Required. Must be a non-negative number.                                |

File constraints:

- Accepted type: `.csv` extension or `text/csv` MIME type
- Maximum size: 2 MB
- Empty data files are rejected
- Empty lines are skipped during parsing

## Validation Logic

Validation is intentionally strict because imported rows become the source data for ROI, CTR, CVR, CPA, funnel, and AI analysis outputs.

- `campaign` and `channel` are required text fields. Empty values, `undefined`, and `null` are rejected
- `budget` must be a positive number because ROI and CPA calculations depend on non-zero spend
- `revenue` must be a non-negative number; zero revenue is valid
- `impressions`, `clicks`, and `conversions` must be non-negative integers
- `clicks` cannot exceed `impressions`
- `conversions` cannot exceed `clicks`
- Duplicate detection uses normalized `campaign` and `channel` values after row validation
- Invalid rows are excluded from the import result rather than coerced or partially repaired

## Validation Outcomes

- Fully valid import: no validation errors; all parsed campaigns are loaded
- Partial import: invalid rows exist, but at least one valid or duplicate-resolvable row remains; users can import valid rows or correct the CSV file and upload it again
- Duplicate resolution required: valid rows contain duplicate campaign/channel groups; users resolve duplicates before import
- Blocked import: no importable rows remain, headers are missing, the file is empty, parsing fails, or file constraints fail

Invalid rows never enter the portfolio store. They are only used to build row-level feedback for the review state.

## Duplicate Resolution

Duplicate detection runs after row validation and only considers valid rows. A duplicate group is created when more than one row has the same normalized campaign name and channel.

Matching is case-insensitive and ignores surrounding whitespace. This allows the same campaign name to appear in different channels without being treated as a duplicate.

Valid non-duplicate rows are imported automatically. Duplicate groups are excluded from import until the user resolves them or explicitly skips unresolved groups. If duplicate groups are the only importable data, at least one duplicate row must be selected before import can continue.

## State Handling

- Empty: no portfolio data exists, so the dashboard shows the upload placeholder
- Loading: the upload form enters a loading state during parsing and validation
- Validation review: validation errors are represented as structured file, header, row, parse, or duplicate errors
- Success: the final campaign set is loaded into the portfolio store

Closing the upload modal resets local form, parse, row-error, duplicate, and pending portfolio state.

## Edge Cases

- Header names may vary by case and surrounding whitespace
- Extra CSV columns are accepted but ignored
- Duplicate detection runs on normalized values, so whitespace and casing differences do not create separate campaign/channel pairs
- Numeric validation catches negative values, non-numeric values, decimal funnel metrics, and impossible funnel relationships
- `revenue` can be `0`; `budget` must be greater than `0`
- Rows with invalid required text fields or invalid metrics are excluded from import

## Limitations

- Only CSV import is supported
- Imports are processed entirely in the browser
- Maximum upload size is 2 MB
- The app keeps one active portfolio after replacement
- Period is report-level metadata, not a per-row CSV field
- Duplicate resolution keeps one selected row per duplicate group; it does not merge duplicate rows
- There is no server-side validation, upload history, persistence, or rollback in this feature

## Future Improvements

- Persist uploaded portfolios between sessions
- Add import history and rollback for replaced datasets
- Support additional file formats such as XLSX
- Add CSV header mapping for custom exports
- Add richer duplicate handling, such as merge or keep all with renamed campaigns
- Add a schema-only CSV template
- Add downloadable validation reports for invalid rows
- Add automated tests around parsing, row validation, duplicate detection, and import outcomes
