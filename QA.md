# Validation — StateLens 0.2

Observed on 2026-10-26 against the public demo.

## Passed
- `npm test`: 22 Node/jsdom tests, including parser and alpha precision, thresholds, unsupported input, CLI exit codes, collector privacy/painting-bound checks, safe JSON rendering, and repeated focus binding.
- Actual desktop cloud-browser navigation to the public demo; both language views render with the concise copy. Screenshots in both READMEs are actual browser captures.
- Tab from the light input to its button activates the light focus row; Tab out of both specimens removes it.
- Synthetic snapshot example distinguishes PASS, EXEMPT with readability advice, and UNSUPPORTED with no ratio/pass badge.
- A supported low-contrast imported JSON pair reports failure (2.32:1 against 4.5:1). Missing required fields report invalid input, not pass.
- JSON and CSS copy produce the expected text; report download completes.

## Not verified
- Mobile viewport and reduced-motion behavior in a real browser.
- Collector execution on a real third-party page, complex stacking or real pixel accuracy. Collector tests use controlled mocks; styles are not pixel measurements.
- Complete accessibility conformance, screen-reader behavior or all browser engines.

The GitHub workflow runs tests, not a live-page accessibility gate. Snapshot results may be stale or manually edited; unsupported cases require manual review.
