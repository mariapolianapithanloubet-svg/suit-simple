

## Add Relevance Filter & Default Sort by Client Name

### Changes — `src/pages/ConsultarProcessos.tsx`

**1. New state** (line 52 area):
```typescript
const [filtroRelevancia, setFiltroRelevancia] = useState('all');
```

**2. Relevance filter buttons** — Add after the existing filter dropdowns (line 185 area), a row of 3 toggle-style buttons:
- **Todos** → `'all'`
- **⭐ Relevante** → `'relevante'`
- **Acompanhamento** → `'acompanhamento'`

Using `Button` with `variant={active ? 'default' : 'outline'}` for visual toggle.

**3. Filter logic** — Add inside the `filtered` useMemo filter callback (after line 99):
```typescript
if (filtroRelevancia !== 'all' && (p.relevancia || '') !== filtroRelevancia) return false;
```

**4. Default sort by client name** — Change initial sort state from `'numero'` to `'cliente'` (line 53).

**5. Update `hasFilters`** — Include `filtroRelevancia !== 'all'` and reset it in `clearFilters`.

**6. Update `filtered` dependency array** — Add `filtroRelevancia`.

No other files changed.

