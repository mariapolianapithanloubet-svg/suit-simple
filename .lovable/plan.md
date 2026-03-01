

## Plan: Delete all processos where origem = 'manual'

There are currently **770 rows** in the `processos` table with `origem = 'manual'`. This will permanently delete all of them.

```sql
DELETE FROM processos WHERE origem = 'manual';
```

No code changes needed — data cleanup only.

