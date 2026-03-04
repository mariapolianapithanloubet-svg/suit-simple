

## Fix Admin Role Detection — Infinite Recursion in RLS

### Root Cause

The `user_roles` table has an "Only admin can manage roles" policy with command `ALL` that checks `user_roles` itself, causing infinite recursion on SELECT. The 500 error confirms this: `"infinite recursion detected in policy for relation "user_roles""`.

### Solution

Two changes needed:

**1. `src/hooks/useAuth.ts`** — Use the existing `has_role` RPC function (which is `SECURITY DEFINER` and bypasses RLS) instead of querying `user_roles` directly:

```typescript
const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
setIsAdmin(!!data);
```

**2. Database migration** — Fix the RLS policy to prevent future issues. Drop the `ALL` policy and replace with separate INSERT/UPDATE/DELETE policies that use `has_role()`:

```sql
DROP POLICY "Only admin can manage roles" ON public.user_roles;

CREATE POLICY "Only admin can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

This eliminates the recursion entirely — both in the immediate client call and in the RLS policies themselves.

| File / Target | Change |
|---|---|
| `src/hooks/useAuth.ts` | Replace direct query with `supabase.rpc('has_role', ...)` |
| DB migration | Replace ALL policy with per-command policies using `has_role()` |

