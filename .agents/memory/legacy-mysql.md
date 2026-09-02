---
name: Legacy MySQL visibility
description: Environment constraint discovered while connecting Django to the existing MySQL database.
---

The configured legacy MySQL connection succeeds, but the selected schema currently exposes zero tables; Django endpoints therefore cannot serve application data until the correct schema/table access is confirmed.

**Why:** The project must preserve the existing database and must not create or alter schema without explicit approval.

**How to apply:** Treat missing-table errors as a database/schema or permission mapping issue first; verify with read-only metadata queries before considering any model or migration change.