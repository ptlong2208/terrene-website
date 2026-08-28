create table if not exists promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  customer_email text not null,
  haravan_order_id bigint not null,
  discount_amount numeric not null,
  payment_method text not null check (payment_method in ('cod', 'payos')),
  created_at timestamptz not null default now()
);
create index if not exists promo_redemptions_code_email_idx on promo_redemptions (code, customer_email);
alter table promo_redemptions enable row level security;

create or replace function count_promo_redemptions(p_code text, p_email text)
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int from promo_redemptions
  where code = p_code and customer_email = p_email;
$$;
grant execute on function count_promo_redemptions to anon;

create policy "Server insert access for promo redemptions"
  on promo_redemptions for insert
  to anon
  with check (true);
