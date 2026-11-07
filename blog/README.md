# Daybreak blog

Static editorial page for **Daybreak: Standup Zero for Switch**. No build step or package installation is required.

## Run locally

Open `index.html`, or start a local server from this directory:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Files

- `index.html` — page content and semantic structure; opens in the light theme.
- `styles.css` — responsive warm-neutral design system, accessible contrast, and reduced-motion support.
- `script.js` — theme and draft-note toggles, copy command, scroll reveals, section navigation, reading progress, and workflow replay.
- `assets/daybreak-sunrise.gif` — bundled ambient sunrise animation used in the hero.
- `assets/workflow-pulse.gif` — bundled workflow animation used in the process section.

## Replace before publishing

Yellow/amber draft marks and “Draft note” boxes identify content that still needs verification. Use the **Draft notes** control to hide them while reviewing the design, but remove or resolve them before publishing.

| Asset | Purpose |
| --- | --- |
| `assets/demo.gif` | Replace the demo placeholder with a real capture of the brief, proposal, approval and GitHub result. |
| `assets/brief.png` | Add a redacted capture of the daily brief. |
| `assets/friday-rule.gif` | Add a capture showing the Friday rule being applied. |

Also verify the setup command, team attribution, origin sentence, test results, lessons, limitations, and blocker thresholds. The repository links currently point to the GitHub URL already present in the page.
