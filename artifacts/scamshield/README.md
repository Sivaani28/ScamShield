# ScamShield

ScamShield is a privacy-first, single-page message checker for everyday use. It looks for a small set of common scam patterns and offers a calm, explainable next step. It is an educational aid—not a security product or a verdict.

## Run locally

```sh
pnpm install
pnpm --filter @workspace/scamshield run dev
```

Build a static production bundle with `pnpm --filter @workspace/scamshield run build`, preview it with `pnpm --filter @workspace/scamshield run serve`, and check types with `pnpm --filter @workspace/scamshield run typecheck`.

## Stack and privacy

- React, TypeScript, and Vite
- A local TypeScript rules module (`src/scam-rules.ts`)
- No backend, account, analytics, storage, or API integration. Message analysis runs in browser JavaScript. The page does not open message links.
- No external font or image services are required.

Messages are held in component memory while the page is open. Clearing the message or reloading the page removes it.

## Scoring and limitations

The local checker applies these starting weights once per matching category: credentials or one-time codes +30; urgency or threats +20; unexpected rewards +20; suspicious URL patterns +20; payment requests +25; organization impersonation +15; secrecy or extreme pressure +10. The sum is capped at 100. Scores 0–29 are Lower Risk, 30–59 Suspicious, and 60–100 High Risk. When a rule matches, the result shows the phrase that triggered it.

These are **unvalidated heuristics**, not measured probabilities. The phrase patterns can miss unfamiliar wording, context, images, attachments, or subtle impersonation. A legitimate message can match a pattern, and a message with no detected warning signs is not guaranteed safe. Always independently verify unexpected requests, especially those involving passwords, codes, money, or personal information.

## Static deployment

Build with `npm run build`, then publish the generated `dist/` directory using any free static host that can serve a Vite SPA (for example, GitHub Pages, Cloudflare Pages, or Netlify). Configure the host's build command as `npm run build` and output directory as `dist`. If deploying under a subpath, configure Vite's `base` for that hosting path before building.

## Known limitations

- English-language, text-only pattern checks; no sender verification, URL reputation, attachment inspection, or threat-intelligence feed.
- The tool cannot determine intent or confirm whether a sender is genuine.
- Its demo messages are clearly fictional and intended only to exercise the interface.

## Future improvements

- Add reviewed, versioned rules with transparent test cases and a community-informed false-positive review process.
- Improve explainability by showing which phrases triggered a rule, while avoiding collection of message content.
- Add opt-in accessibility and localization refinements, plus an offline test suite for the local scoring module.
