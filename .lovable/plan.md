

## Plan: Fix blank Process List by removing invalid processes

Run a single SQL DELETE to remove any `processos` rows where `categoria`, `esfera`, or `status` is NULL, which may be causing rendering issues.

```sql
DELETE FROM processos
WHERE categoria IS NULL
   OR esfera IS NULL
   OR status IS NULL;
```

No code changes needed — data cleanup only.

