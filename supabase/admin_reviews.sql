-- Admin allowlist + permissions for reviews moderation (approve/reject) and
-- review-photo cleanup. Locked down entirely: no policy grants anon/authenticated
-- read or write on admin_emails directly — the only access path is the
-- SECURITY DEFINER is_admin() function below, same pattern as verify_order_lookup
-- in order_lookup.sql.
--
-- Depends on reviews.sql (the `reviews` table and `review-photos` bucket must
-- already exist) — run that one first.
--
-- Seeding real admin emails is intentionally NOT part of this file — run that
-- as a separate one-off insert (see PLAN.md) rather than committing personal
-- email addresses to git history.
create table if not exists admin_emails (
  email text primary key
);
alter table admin_emails enable row level security;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_emails where email = auth.jwt() ->> 'email'
  );
$$;

grant execute on function is_admin() to authenticated;

-- reviews: authenticated admins can see everything (not just approved, unlike anon)
create policy "Admins can view all reviews"
  on reviews for select
  to authenticated
  using (is_admin());

-- reviews: authenticated admins can approve (update status) or reject (delete)
create policy "Admins can update reviews"
  on reviews for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "Admins can delete reviews"
  on reviews for delete
  to authenticated
  using (is_admin());

-- storage.objects: authenticated admins can delete photos of rejected reviews
create policy "Admins can delete review photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'review-photos' and is_admin());
