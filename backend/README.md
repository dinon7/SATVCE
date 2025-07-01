## Direct Supabase Postgres Access (Admin Utility)

A utility module is available at `app/services/pg_pooler.py` for direct SQL access to the Supabase Postgres database via the transaction pooler. This is intended for admin/maintenance scripts only.

**Usage Example:**

```python
from app.services.pg_pooler import test_pg_connection

test_pg_connection()  # Prints current DB time if connection is successful
```

**Important Notes:**
- Credentials are loaded from `.env` (see `user`, `password`, `host`, `port`, `dbname`).
- Do **not** use this for user-facing endpoints or core app logic—prefer the Supabase HTTP API for those cases.
- Never expose these credentials to the frontend or version control.
- This utility bypasses Supabase RLS and API features—use with care. 