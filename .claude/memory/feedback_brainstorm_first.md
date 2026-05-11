---
name: feedback_brainstorm_first
description: Always brainstorm before any code change — no exceptions, even for refactors with explicit instructions
type: feedback
originSessionId: 6703c3b6-db51-489e-b544-90f767bf2ff5
---
Brainstorm before writing any code. No exceptions — not for new features, refactors, bug fixes, or even when the user gives explicit step-by-step instructions. The workflow rule is mandatory every time.

**Why:** User has corrected this multiple times. Even when instructions seem clear and complete, the brainstorm step surfaces assumptions, trade-offs, and scope decisions the user may want to weigh in on before implementation starts. Skipping it — even once — is a violation of the agreed workflow.

**How to apply:** For every interaction that will change code: lay out the plan (files affected, approach, trade-offs), then wait for explicit approval ("go", "yes", "looks good") before writing a single line. "go" from the user on a brainstorm is the trigger to implement — not the presence of detailed instructions in the request.

**Previous incident:** In session where user said "lets remove channelTotals / create a selectedChannels array / use that in charts...", I skipped brainstorming and went straight to reading files and implementing. User had to interrupt with "do not forget to brainstorm" mid-task.

**Also applies to:** Reinterpreting a request mid-task — if direction changes, stop and confirm before switching approach.

**Second incident:** User asked to consolidate 4 Maps in `aiAnalysisStore` into one. I skipped brainstorming and went straight to implementation. User sent "ALWAYS" to reinforce the rule with no exceptions.

**Third incident:** User suggested "we can use a wrapper element" as feedback on the brainstorm. I interpreted it as approval and immediately implemented. The user had NOT confirmed the brainstorm — directional feedback mid-brainstorm is NOT an approval signal. Only explicit confirmation ("go", "yes", "build it", "looks good") means proceed.
