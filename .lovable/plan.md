

## Typography & Visual Hierarchy Overhaul

### Approach
Switch the global font from DM Sans/DM Serif Display to **Inter** and apply a consistent typographic scale across the entire app. Only CSS and className changes — no layout or functionality changes.

### Changes

**1. `src/index.css`** — Replace font import and CSS variables
- Replace Google Fonts import: `DM Sans` + `DM Serif Display` → `Inter` (weights 300–700)
- Update `--font-display` and `--font-body` to both use `'Inter', system-ui, sans-serif`
- Update `h1, h2, h3` base styles: remove `font-family: var(--font-display)`, use Inter with `font-weight: 600`

**2. `tailwind.config.ts`** — Update fontFamily
- Change `display` and `body` to `['Inter', 'system-ui', 'sans-serif']`

**3. `src/components/ProcessForm.tsx`** — Apply typography scale
- Page title (`h2`): `text-[28px] font-semibold` (remove `font-display font-bold`)
- Section titles (`CardTitle`): `text-[18px] font-semibold tracking-[0.02em]` (remove `font-display`)
- Labels: `text-[13px] font-medium text-[#374151]`
- Increase form section spacing: `space-y-10` → `space-y-12`

**4. `src/pages/ConsultarProcessos.tsx`** — Apply typography scale
- Page title: `text-[28px] font-semibold` (remove `font-display font-bold`)
- Table headers: `text-[13px] font-semibold uppercase tracking-[0.03em]`
- Table body: `text-[14px] font-normal`

**5. `src/components/DashboardStats.tsx`** — Apply typography scale
- Page title: `text-[28px] font-semibold` (remove `font-display`)
- Card section titles: `text-[18px] font-semibold tracking-[0.02em]` (remove `font-display`)
- Stat labels: `text-[13px] font-medium`
- Body text: `text-[14px]`

**6. `src/components/AppLayout.tsx`** — Sidebar typography
- App name: `text-lg font-bold` (remove `font-display`)
- Nav links: already `text-sm font-medium` — keep as-is
- Mobile header app name: remove `font-display`

**7. `src/components/ProcessDetail.tsx`** — Same pattern for any `font-display` usage and title sizing

**8. Admin pages** (`CategoriasPage`, `TiposVinculoPage`, `TribunaisPage`) — Same `font-display` removal and title standardization

### Summary of Scale
| Element | Size | Weight | Extra |
|---|---|---|---|
| Page titles | 28px | 600 | — |
| Section titles | 18px | 600 | `letter-spacing: 0.02em` |
| Form labels | 13px | 500 | `color: #374151` |
| Body/table content | 14px | 400 | — |
| Table headers | 13px | 600 | `uppercase`, `letter-spacing: 0.03em` |

