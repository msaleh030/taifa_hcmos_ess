# HCMOS™ — Taifa Human Capital Management Operating System

Design implementation imported from the Claude Design project **HCMOS Design Spec – Standalone**.
It bundles the interactive HCMOS™ product prototype, the authoritative visual build
specification, and the fourteen approved screen-flow prototypes it references.

## What's here

| Entry point | What it is |
|---|---|
| `index.html` | The full HCMOS™ + ESS product prototype — role-based login, console modules and the mobile ESS app. |
| `HCMOS Design Spec.html` | The visual build specification — foundations, component kit, and every console/ESS screen with token-level redlines and live embeds of the approved prototypes. |
| `HCMOS *.html` (flow files) | The fourteen approved screen-flow prototypes (Auth, Workforce Overview, Employee Master, KPI Scorecard, Leave & Liability, Disciplinary, Exact & Asset, Governance & ESS, Tenant Provisioning, ESS Services, Attendance). Each has a top switcher to walk every state · theme · surface · language. |

### Product prototype (`index.html`)

React 18 + Babel-standalone, loaded from CDN and transpiled in the browser — no build step.
Source is split into data modules (`data.jsx`, `kpi-data.jsx`, `template-data.jsx`, …),
a shared UI kit (`ui.jsx`, `styles.css`), a bi-directional store (`store.jsx`), i18n
(`i18n.jsx`, English ⇄ Kiswahili) and one file per console/ESS module (`mod-*.jsx`).
Sign in as any of the 13 roles to see role-scoped navigation, confidential-field gating,
and the ESS ⇄ console sync.

### Visual build specification (`HCMOS Design Spec.html`)

The acceptance reference the built UI must match, screen by screen. Each screen entry embeds
its approved flow prototype (via lazy-loaded iframes) beside token redlines, the full state
set, and the confidentiality / wording rules. The flow prototypes are self-contained
(`<flow>-flow.js` + `<flow>-i18n.js`, or the KPI catalogue for the scorecard).

## Running locally

Both entry points load cross-file resources (CSS, JSX, and — for the spec — iframes), so
serve over HTTP rather than opening `file://`:

```bash
python3 -m http.server 8000
```

Then open:

- Product prototype — <http://localhost:8000/index.html>
- Design specification — <http://localhost:8000/HCMOS%20Design%20Spec.html>

Outbound access to `unpkg.com` (React/Babel) and Google Fonts is required for the product
prototype to render.

## Notes

- Illustrative data throughout (Taifa Mining & Civil, Tanzania statutory model). No real records.
- `assets/taifa-logo.png` is the brand mark used by the login, sidebar and ID cards.
