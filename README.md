# AdaptFit Waitlist

Landing page + waitlist signup for AdaptFit, backed by Supabase.

## Project structure

```
index.html               Page markup
src/style.css            All styles
src/main.js               Form logic + hero canvas animation
src/supabaseClient.js     Supabase connection + insert helper
supabase/migrations/      SQL to create the waitlist table
.env.example              Template for your Supabase credentials
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Supabase project at https://supabase.com if you don't have one.

3. Run the migration in `supabase/migrations/0001_create_waitlist.sql` against
   your project — either paste it into the Supabase SQL Editor, or, if you use
   the Supabase CLI:
   ```
   supabase link --project-ref your-project-ref
   supabase db push
   ```

4. Copy `.env.example` to `.env` and fill in your project's URL and anon key
   (Supabase dashboard → Settings → API). Make sure the URL is the full project URL
   beginning with `https://` and not the anon key itself:
   ```
   cp .env.example .env
   ```

5. Start the dev server:
   ```
   npm run dev
   ```
   Open the printed local URL — submitting the form writes a row to the
   `waitlist` table.

6. Build for production:
   ```
   npm run build
   ```
   Output goes to `dist/` — deploy it anywhere that serves static files
   (Vercel, Netlify, Cloudflare Pages, etc.). Set the same two environment
   variables in your hosting provider's dashboard.

## Notes on the backend

- The `waitlist` table has row-level security enabled. The anon key can only
  **insert** rows — it can't read, update, or delete them. That's intentional:
  the public site should never be able to dump the email list.
- If signups do not appear, double-check your `.env` values and confirm the
  `waitlist` table exists in your Supabase project.
- To view signups, use the Supabase dashboard's Table Editor, or query with
  the `service_role` key from a trusted server-side context (never expose
  that key in frontend code).
- Duplicate emails are rejected at the database level (`unique` constraint)
  and surfaced in the UI as "you're already on the list."
