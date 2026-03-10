

## Highlight Relevant Processes in Consultar Processos

### Changes

**`src/pages/ConsultarProcessos.tsx`** — Two modifications in the `TableBody` mapping (lines 215-257):

1. **Row styling** — Add conditional classes to `TableRow` when `p.relevancia === 'relevante'`:
   ```
   bg-yellow-50 border-l-4 border-yellow-400
   ```

2. **Star icon in number cell** — Prepend a `Star` icon (from lucide-react, filled yellow) before the process number when relevant:
   ```tsx
   <TableCell className="font-medium">
     <span className="inline-flex items-center gap-1.5">
       {p.relevancia === 'relevante' && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />}
       {getNumeroFaseAtual(p)}
     </span>
   </TableCell>
   ```

3. **Import** — Add `Star` to the lucide-react import.

No other files affected.

