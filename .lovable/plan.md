

## Fix Edit Processo Redirect

The edit page at `/processos/:id/editar` is **already fully implemented** — the route exists, `ProcessForm` loads `initialData`, and `updateProcesso` calls Supabase update.

### Only Change Needed

**`src/components/ProcessForm.tsx` (line 125)**
- Change the post-save redirect from `/processos` to `/consultar` so users return to the consultation table after editing.

Current: `navigate('/processos');`
Updated: `navigate(mode === 'edit' ? '/consultar' : '/processos');`

That's it — everything else is already wired up.

