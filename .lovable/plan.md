

## Restrict Signups to @pithan-loubet.com.br — Server-Side

### Situation

You want to use Supabase Auth's built-in "allowed email domains" setting to restrict signups. However, I do not have a tool to configure Auth settings (like allowed email domains) directly from here. The `supabase/config.toml` file is auto-managed and should not be edited manually.

### Available Server-Side Options (Without Edge Function)

Since an edge function is off the table, here are the viable approaches:

**Option A — Client-side validation + existing DB function (recommended given constraints)**
- The `check_email_domain()` function already exists in the database
- We cannot attach a trigger to `auth.users` (reserved schema), so it can't auto-enforce on signup
- Add robust client-side validation in `Auth.tsx` that blocks non-`@pithan-loubet.com.br` emails before the signup call
- This is a UX gate, not a true server-side block

**Option B — Manual backend configuration**
- You can configure the allowed email domain restriction directly in the backend settings
- Navigate to the Cloud panel → Authentication settings and set the allowed domain to `pithan-loubet.com.br`

### Recommended Plan

Since I cannot configure the Auth allowed-domains setting programmatically, I recommend:

1. **You manually set the allowed domain** in the backend Auth settings (Cloud panel → Auth)
2. **I update `Auth.tsx`** to add client-side domain validation as a UX convenience:
   - Block signup if email doesn't end with `@pithan-loubet.com.br`
   - Show error: "Apenas e-mails @pithan-loubet.com.br são permitidos"
   - Update placeholder to `seu@pithan-loubet.com.br`
   - Add helper text noting the restriction

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Domain validation, updated placeholder, helper text |

This gives you both server-side enforcement (via Auth config) and a good user experience (immediate client feedback).

