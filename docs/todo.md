# Clerk User Sync: Polling-Based Implementation (Replaces Webhooks)

## Overview
- Webhooks are being replaced with a robust polling-based sync for Clerk users.
- This approach is more reliable in both production and development, avoids signature verification issues, and works without public endpoints.

## Implementation Plan
1. **Create a Scheduled Polling Route**
   - Add `src/app/api/cron/clerk-sync/route.ts`.
   - This route fetches all users from Clerk's Backend API and upserts them into Supabase.
   - Schedule this route to run every 5–10 minutes using Vercel Cron, GitHub Actions, or a cloud scheduler.

2. **Polling Logic**
   - Fetch all users from Clerk using the Backend API.
   - For each user:
     - Upsert into the `users` table (idempotent).
     - Update email, metadata, etc.
   - (Optional) Mark users as deleted in Supabase if they no longer exist in Clerk.

3. **Remove Webhook Handler**
   - Delete or comment out `src/app/api/webhooks/clerk/route.ts`.
   - Remove the webhook endpoint from the Clerk dashboard.

4. **(Optional) On-Demand Sync**
   - In backend routes where fresh user data is needed, fetch from Clerk and upsert as needed.

5. **Error Handling & Logging**
   - Log all sync attempts and errors.
   - Alert if sync fails repeatedly.

6. **Testing**
   - Manually trigger the sync route and verify users are correctly upserted/updated/deleted in Supabase.

## References
- [Clerk Backend API Docs](https://clerk.com/docs/reference/backend-api/tag/Users)
- [Polling in JavaScript (dev.to)](https://dev.to/siddharthssb11/polling-requests-to-an-api-in-javascript-1g2d)
- [Are you struggling with Clerk webhooks? Not anymore! (dev.to)](https://dev.to/mihir_bhadak/are-you-struggling-with-clerk-webhooks-not-anymore-3ebh)

---

Absolutely! Here’s a clear mapping of all batches (groups of files) that need edits for robust JWT verification, Clerk error handling, RLS user mapping, and endpoint documentation. This is based on your codebase structure and the semantic/code search results above.

---

## **Batch 1: Quiz API Endpoints**
These endpoints handle quiz sessions, submissions, and results. All are **protected** and require robust JWT and user mapping.

- `src/app/api/quiz/session/[sessionId]/route.ts`
- `src/app/api/quiz/session/current/route.ts`
- `src/app/api/quiz/session/save/route.ts`
- `src/app/api/quiz/submit/route.ts`
- `src/app/api/quiz/submit-complete/route.ts`
- `src/app/api/quiz/followup/submit/route.ts`
- `src/app/api/quiz/results/[sessionId]/route.ts`
- `src/app/api/quiz/results/save-preferences/route.ts`

---

## **Batch 2: Careers API Endpoints**
These endpoints handle career matches, favorites, and search. All are **protected**.

- `src/app/api/careers/match/route.ts`
- `src/app/api/careers/matches/route.ts`
- `src/app/api/careers/matches/batch/route.ts`
- `src/app/api/careers/favorites/route.ts`
- `src/app/api/careers/search/route.ts`

---

## **Batch 3: User API Endpoints**
These endpoints handle user progress, activity, preferences, sessions, and data deletion. All are **protected**.

- `src/app/api/user/progress/route.ts`
- `src/app/api/user/activity/route.ts`
- `src/app/api/user/preferences/route.ts`
- `src/app/api/user/sessions/route.ts`
- `src/app/api/user/data/route.ts`

---

## **Batch 4: Subjects API Endpoints**
Some endpoints are **protected** (favorites), others may be **public** (subject list).

- `src/app/api/subjects/favorites/route.ts` (**protected**)
- `src/app/api/subjects/list/route.ts` (**public** — should be documented as such)

---

## **Batch 5: PDF and Miscellaneous Endpoints**
- `src/app/api/pdf/generate/route.ts` (**protected**)
- Any other endpoints that use Clerk JWT or Supabase user mapping.

---

## **Batch 6: Webhook and Admin Endpoints**
- `src/app/api/webhooks/clerk/route.ts` (**admin/service role** — already handled, but should be clearly documented)

---

### **Summary Table**

| Batch   | Endpoints (files) | Auth Type      | Notes                        |
|---------|-------------------|----------------|------------------------------|
| 1       | Quiz              | Protected      | JWT, Clerk, RLS mapping      |
| 2       | Careers           | Protected      | JWT, Clerk, RLS mapping      |
| 3       | User              | Protected      | JWT, Clerk, RLS mapping      |
| 4       | Subjects          | Mixed          | Favorites: protected         |
| 5       | PDF/Misc          | Protected      | JWT, Clerk, RLS mapping      |
| 6       | Webhook/Admin     | Admin/Service  | Already robust, doc only     |

---

### **What Will Be Edited in Each Batch?**
- Add or improve JWT verification and Clerk error handling.
- Ensure correct mapping from Clerk JWT to internal user ID for RLS.
- Add clear comments at the top of each file:  
  - `// Protected endpoint: Requires valid JWT`  
  - or  
  - `// Public endpoint: No authentication required`
- Add comments on Supabase client usage (user vs. admin).

---

**Let me know if you want to start with a specific batch, or I can proceed in order (Quiz → Careers → User → Subjects → PDF → Webhook/Admin).**  
Would you like to review each batch after edits, or proceed with all and review at the end?

The question 15 does not display the dropdown for vce vet subjects