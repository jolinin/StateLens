# StateLens

**English** · [简体中文](README.zh.md)

A small, original UI-state contrast workbench by Liyan Chen. Zero dependencies. MIT.

[**Try the live demo**](https://statelens-design-lab.fuzzy-boar-2990.chatgpt.site) · [中文使用说明](README.zh.md)

![StateLens desktop overview: semantic palette editor and paired light/dark previews](docs/assets/overview.jpg)

Edit semantic HEX tokens, compare light and dark specimens, inspect default / hover / focus / error / disabled states, and export reusable CSS or JSON. The matrix follows the selected state, not real-time pointer or keyboard focus.

## What you can do
- Edit eight semantic HEX tokens independently for light and dark themes.
- Compare default, hover, focus, error and disabled states in editable specimens.
- Inspect contextual text and UI contrast checks, including disabled exemptions.
- Copy or download both palettes as reusable CSS or JSON.

![Actual error-state preview and contrast matrix in both themes](docs/assets/error-state.jpg)

*Real desktop browser captures. These are not mobile screenshots or generated mockups.*

## Run
Open `dist/index.html` directly, or serve `dist/` with any static server. No install or build step. Edits are in tab memory only; refresh resets them. Export first.

## Reuse
CSS export contains two palettes (`[data-theme="light"]`, `[data-theme="dark"]`) and `.sl-card`, `.sl-input`, `.sl-button`, `.sl-error` rules. JSON contains palettes and thresholds. Native disabled and aria-invalid attributes control the component examples.

## Scope
Contrast uses WCAG sRGB relative luminance. Normal text target 4.5:1, large text 3:1, necessary non-text boundaries generally 3:1. Comparisons use full precision, not rounded display values. Disabled controls are exempt, not passing. Opaque solid HEX only. Focus color is only one part of focus accessibility. This is not a full accessibility audit or certification.

## Tests
`node tests/contrast.test.cjs`

Live browser checks cover invalid values, failure ratios, paired theme isolation, repeated state changes, retained specimen input, reset, and actual CSS/JSON clipboard and downloads. See `QA.md` for remaining platform-specific limits.

## Why this experiment
The hypothesis is that state-aware paired previews make token handoff easier than checking isolated color pairs. Existing tools already serve contrast and token workflows; this is not a claim of novelty or superiority.

Public issue examples, used as context rather than copied implementation:
- https://github.com/shadcn-ui/ui/issues/12344
- https://github.com/casdoor/casdoor/issues/5639 (historical, closed)
- https://github.com/we-promise/sure/issues/1736 (historical, closed)

Standards:
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html

Feedback welcome: which interaction states do you most often miss during design handoff?

## License

[MIT](LICENSE) · Copyright © 2026 Liyan Chen.
