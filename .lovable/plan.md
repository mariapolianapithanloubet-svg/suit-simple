

## Fix Admin Detection

### Root Cause
The `user_roles` table has **all RESTRICTIVE** RLS policies (Permissive: No). In PostgreSQL, restrictive policies only narrow access — they require at least one **permissive** policy to grant initial access. Since there are zero permissive SELECT policies, the query always returns empty results regardless of the data.

The network logs confirm this: `GET /user_roles?...role=eq.admin` returns `[]`.

### Changes

**1. Database migration** — Change the SELECT policy to PERMISSIVE:
```sql
DROP POLICY "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
```

**2. `src/hooks/useAuth.ts`** — Update `checkAdmin` per your suggestion with explicit role check and console.log:
```typescript
const checkAdmin = async (userId: string) => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  console.log('User role:', data);
  const admin = data?.role === 'admin';
  setIsAdmin(admin);
};
```

