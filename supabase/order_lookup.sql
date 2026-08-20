-- Order lookup registry for /track-order. Haravan's Admin API can't look up an
-- order by its display name (e.g. "#10025"), only by internal numeric ID, so this
-- table maps (order name + phone) -> haravan_order_id, populated at checkout time.
--
-- Locked down the same way as admin_reviews.sql: RLS enabled, only an INSERT policy
-- for anon (checkout writes a row after creating the Haravan order) — no SELECT
-- policy at all. The only read path is verify_order_lookup(), a SECURITY DEFINER
-- function requiring both order_name AND phone to match before returning anything,
-- so a customer can't enumerate other people's orders by guessing order codes alone.
create table if not exists order_lookup (
  order_name text primary key,
  haravan_order_id bigint not null,
  phone text not null,
  created_at timestamptz not null default now()
);
alter table order_lookup enable row level security;

create policy "anon can insert order lookups"
  on order_lookup for insert
  to anon
  with check (true);

create or replace function verify_order_lookup(p_order_name text, p_phone text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select haravan_order_id
  from order_lookup
  where order_name = p_order_name
    and phone = p_phone
  limit 1;
$$;

grant execute on function verify_order_lookup(text, text) to anon;
