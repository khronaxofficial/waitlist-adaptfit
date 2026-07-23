-- Waitlist table for AdaptFit signups
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  gear text,
  created_at timestamptz default now()
);

-- Row Level Security: public site can only INSERT, never read/update/delete
alter table waitlist enable row level security;

create policy "Public can join waitlist"
  on waitlist
  for insert
  to anon
  with check (true);

-- No select/update/delete policy for anon -> signups are write-only from
-- the public site. Read them from the Supabase dashboard or with the
-- service_role key in a trusted backend/admin context.

-- Optional: index for faster lookups if you query by gear type later
create index if not exists waitlist_gear_idx on waitlist (gear);
