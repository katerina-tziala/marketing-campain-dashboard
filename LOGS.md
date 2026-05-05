 
## [#1] Logo SVG: equal padding, square viewBox, and gradient stop precision
**Type:** update

**Summary:** Reworked the logo SVG to have equal horizontal padding (2.66 units each side), a square 68.66×68.66 viewBox with content centered vertically, and corrected gradient stops so the light color falls precisely at each bar's midpoint.

**Brainstorming:** The original SVG had no left padding while the right side had a 2.66-unit gap between the light-purple pie piece and the viewBox edge. Equal horizontal padding required matching that gap on the left via a translate. Making the viewBox square required computing the vertical center offset: (68.66 − 48) / 2 = 10.33. Gradient stops were approximate and causing the light hue to land off-center; precise stop positions were calculated by converting each bar's left edge, midpoint, and right edge to percentages of the 38-unit gradient span.

**Prompt:** Can we have same space from the beginning to the first bar? Make the viewBox height 68.66 and move items to be centered vertically — no more changes. Can you check the linear gradients so the light color is always in the middle of the items?

**What changed:**
- `app/src/assets/logo.svg` — added `<g transform="translate(2.66, 10.33)">` to center content in a square 68.66×68.66 viewBox; corrected all nine gradient stop offsets to precise calculated values (0%, 13.2%, 26.3%, 35.5%, 48.7%, 61.8%, 71.1%, 84.2%, 97.4%) so light colors land at bar midpoints and dark colors start at bar edges

**Key decisions & why:**
- Used `translate` on the content group rather than a negative-origin viewBox to keep path coordinates clean and readable
- `gradientUnits="userSpaceOnUse"` gradient coords remain valid inside the `<g transform>` because the spec interprets them in the local coordinate system of the referencing element — no gradient coordinate adjustment needed
- Removed a transparent `<rect>` that was added during iteration — `fill="none"` is invisible and the viewBox itself defines the canvas, so the rect served no purpose


## [#2] Logo SVG: resize viewBox to 72×72 and create dark-background preview
**Type:** update

**Summary:** Updated the logo viewBox to 72×72 with content re-centered, and created a preview copy that fills the viewBox with the app's background color for accurate visual review.

**Brainstorming:** Moving from 68.66 to 72 adds 3.34 units total (1.67 per side). The existing horizontal content positioning within 68.66 was already balanced, so the new translate x = 2.66 + 1.67 = 4.33 preserves that relative spacing while centering within the wider canvas. Vertical center = (72 − 48) / 2 = 12. The preview file needed the HTML background color (`rgb(7, 10, 21)`, from `--neutral-900`) placed as a `<rect>` behind all content so the logo can be reviewed in isolation without opening the app.

**Prompt:** Update logo so viewBox is 72 height and 72 width, align items vertically in the middle, align items horizontally respecting current horizontal space. Create a copy of the logo and use that background in the viewBox.

**What changed:**
- `app/src/assets/logo.svg` — viewBox updated to `0 0 72 72`; `<g transform>` updated to `translate(4.33, 12)` to re-center content
- `app/src/assets/logo.preview.svg` — new file; identical to logo.svg with a `<rect width="72" height="72" fill="rgb(7, 10, 21)" />` as the first child to simulate the app's dark background

**Key decisions & why:**
- New translate x derived by adding half the viewBox width delta to the existing offset: `2.66 + (72 − 68.66) / 2 = 4.33` — keeps the content's relative horizontal balance intact
- Preview file kept as a sibling in `assets/` rather than a separate folder; the `.preview.svg` suffix makes it clear it is not a production asset
