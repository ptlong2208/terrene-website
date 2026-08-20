-- Product reviews (submitted via app/api/reviews/route.ts, shown via ReviewsSection).
-- Inserts always land as 'pending' — the public GET route only ever reads 'approved'.
-- See admin_reviews.sql for the moderation policies (update/delete) layered on top.
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  reviewer_name text not null,
  reviewer_email text not null,
  comment text not null,
  photo_urls text[] not null default '{}',
  verified_purchase boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
alter table reviews enable row level security;

create policy "Public read access for approved reviews"
  on reviews for select
  to anon
  using (status = 'approved');

create policy "Public insert access for pending reviews"
  on reviews for insert
  to anon
  with check (status = 'pending');

-- Storage bucket for review photos — public read (so approved photos render on the
-- site), anon upload (so the submit form can attach photos before moderation).
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

create policy "Public read access for review photos"
  on storage.objects for select
  to public
  using (bucket_id = 'review-photos');

create policy "Public upload access for review photos"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'review-photos');
