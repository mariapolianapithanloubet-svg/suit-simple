

## Plan: Delete processos with NULL origem

Execute a single SQL DELETE to remove all rows from `processos` where `origem IS NULL`.

```sql
DELETE FROM processos WHERE origem IS NULL;
```

No code changes needed — data cleanup only.

