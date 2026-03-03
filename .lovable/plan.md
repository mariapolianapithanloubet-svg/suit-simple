

## Plan: Group clients by "grupo" on the CLIENTES page

### Changes: `src/components/ClientRanking.tsx` and `src/App.tsx`

**1. Pass `grupos` to `ClientRanking`**
- In `App.tsx` line 54, pass `grupos` prop: `<ClientRanking processos={processos} grupos={grupos} />`

**2. Rewrite `ClientRanking.tsx` grouping logic**
- Accept `grupos` prop (type `Grupo[]`)
- Build client ranking as today, but also track each client's `grupoId` by looking up the processos
- Group clients into sections:
  - One collapsible section per grupo (sorted alphabetically by grupo name)
  - One "CLIENTES INDIVIDUAIS" section for clients whose processes have no `grupoId`
- Within each section, sort clients alphabetically by name
- Each client card shows: name, process count, relevantes/acompanhamento badges (same as current)

**3. UI Structure**
- Use `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` from Radix
- Each section header: grupo name (uppercase) + client count badge + chevron
- Sections open by default
- "CLIENTES INDIVIDUAIS" section rendered last

**No changes to**: PROCESSOS page, database schema, authentication, RLS

