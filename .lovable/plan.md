

## Fix Admin Role Detection in Frontend

### Problem
The `useAuth` hook uses `supabase.rpc('has_role', ...)` which may be returning unexpected data (e.g., the RPC result isn't being parsed as a boolean correctly). The delete button in Consultar Processos is hidden because `isAdmin` stays `false`.

### Solution
Replace the RPC call with a direct query to `user_roles` table, which is more reliable and debuggable.

### Changes

**`src/hooks/useAuth.ts`** — Update `checkAdmin` function:
- Replace `supabase.rpc('has_role', ...)` with a direct query:
  ```ts
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  setIsAdmin(!!data);
  ```
- This bypasses any RPC serialization issues and queries the table directly
- The existing RLS policy "Users can read own roles" allows authenticated users to read their own roles

No other files need changes — `isAdmin` is already correctly passed through `App.tsx` → `ConsultarProcessos`.

